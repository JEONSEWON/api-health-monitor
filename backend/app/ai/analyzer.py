import asyncio
import ipaddress
import json
import socket
import urllib.parse
from typing import Optional

import httpx

from app.ai.client import get_async_client, get_client
from app.config import get_settings

_settings = get_settings()

# ── SSRF Protection ──────────────────────────────────────────────────────────


def _is_private_ip(ip_str: str) -> bool:
    """Return True if the IP address is private, loopback, link-local, or reserved."""
    try:
        addr = ipaddress.ip_address(ip_str)
        return (
            addr.is_private
            or addr.is_loopback
            or addr.is_link_local
            or addr.is_reserved
            or addr.is_unspecified
            or addr.is_multicast
        )
    except ValueError:
        return True  # unparseable → block


def _is_blocked_url(url: str) -> bool:
    try:
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return True
        hostname = parsed.hostname or ""
        if not hostname:
            return True

        # Block obviously internal hostnames
        _BLOCKED_NAMES = {"localhost", "metadata.google.internal", "169.254.169.254"}
        if hostname.lower() in _BLOCKED_NAMES:
            return True

        # Check whether hostname is a literal IP address (not a domain)
        try:
            ipaddress.ip_address(hostname)  # raises ValueError if it's a domain
            # It's a literal IP — check if private
            return _is_private_ip(hostname)
        except ValueError:
            pass  # hostname is a domain name — continue with DNS check

        # Domain name: attempt DNS resolution to block IPs in private ranges
        # Fail-open: if DNS is unavailable, allow the URL so legitimate webhooks aren't broken
        try:
            results = socket.getaddrinfo(hostname, 80, proto=socket.IPPROTO_TCP)
            for _, _, _, _, sockaddr in results:
                ip = sockaddr[0]
                if _is_private_ip(ip):
                    return True
        except Exception:
            pass  # DNS unavailable — allow

        return False
    except Exception:
        return True


def analyze_incident(
    monitor_name: str,
    monitor_url: str,
    status: str,
    status_code: Optional[int],
    response_time: Optional[int],
    error_message: Optional[str],
) -> Optional[dict]:
    """Call Claude Haiku to analyze a failed check. Returns dict or None on error."""
    try:
        client = get_client()

        lines = [
            f"Monitor: {monitor_name}",
            f"URL: {monitor_url}",
            f"Status: {status}",
        ]
        if status_code:
            lines.append(f"HTTP Status Code: {status_code}")
        if response_time:
            lines.append(f"Response Time: {response_time}ms")
        if error_message:
            lines.append(f"Error: {error_message}")

        context = "\n".join(lines)

        message = client.messages.create(
            model=_settings.AI_MODEL,
            max_tokens=300,
            messages=[{
                "role": "user",
                "content": (
                    "You are an API monitoring assistant. Analyze this failed health check.\n\n"
                    f"{context}\n\n"
                    "Respond in JSON with exactly these fields:\n"
                    '- "summary": one sentence plain-language summary (max 100 chars)\n'
                    '- "possible_causes": array of 2-3 short strings\n'
                    '- "recommended_actions": array of 1-2 short action strings\n\n'
                    "JSON only, no markdown."
                ),
            }],
        )

        if not message.content:
            return None
        text = message.content[0].text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()
        return json.loads(text)

    except Exception as e:
        print(f"⚠️  AI analysis failed: {e}")
        return None


async def analyze_endpoint(url: str) -> dict:
    """
    Call the URL, inspect the response, and ask Claude to recommend
    monitor settings: method, expected_status, keyword, assertions.

    Raises ValueError for blocked/invalid URLs.
    Raises RuntimeError for HTTP/AI failures.
    """
    if _is_blocked_url(url):
        raise ValueError("URL not allowed")

    # ── Fetch the endpoint (async) ────────────────────────────────────────
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True, max_redirects=3) as client:
            response = await client.get(
                url,
                headers={"User-Agent": "CheckAPI-Wizard/1.0 (+https://checkapi.io)"},
            )
    except httpx.TimeoutException:
        raise RuntimeError("Request timed out")
    except Exception as e:
        raise RuntimeError(f"Failed to reach URL: {e}")

    status_code = response.status_code
    content_type = response.headers.get("content-type", "")
    raw_body = response.text[:3000]

    # ── Ask Claude (async) ────────────────────────────────────────────────
    try:
        ai_client = get_async_client()

        prompt = (
            "You are an API monitoring configuration assistant.\n\n"
            f"URL: {url}\n"
            f"HTTP Status Code: {status_code}\n"
            f"Content-Type: {content_type}\n"
            f"Response Body (truncated):\n{raw_body}\n\n"
            "Based on this response, recommend the best monitor settings.\n"
            "Respond with JSON only (no markdown) with exactly these fields:\n"
            '- "method": HTTP method string, e.g. "GET"\n'
            '- "expected_status": integer status code to expect, e.g. 200\n'
            '- "keyword": a short string that should be present in the response body to confirm health (null if none makes sense)\n'
            '- "keyword_present": boolean, true if keyword must be present\n'
            '- "assertions": array of up to 3 JSON Path assertion objects, each with:\n'
            '    {"path": "$.field", "operator": "equals"|"contains"|"exists", "expected": "value"}\n'
            '  Only include assertions if the response is JSON. Empty array otherwise.\n'
            '- "reasoning": one sentence explaining your choices (max 120 chars)\n'
        )

        message = await ai_client.messages.create(
            model=_settings.AI_MODEL,
            max_tokens=400,
            messages=[{"role": "user", "content": prompt}],
        )

        print(f"[AI] response stop_reason={message.stop_reason} content_blocks={len(message.content)}")
        if not message.content:
            raise RuntimeError("AI returned empty response (no content blocks)")

        block = message.content[0]
        if block.type != "text":
            raise RuntimeError(f"AI returned unexpected block type: {block.type}")

        text = block.text.strip()
        print(f"[AI] raw text ({len(text)} chars): {text[:200]}")

        if not text:
            raise RuntimeError("AI returned empty text")

        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()

        result = json.loads(text)

        return {
            "method": str(result.get("method", "GET")).upper(),
            "expected_status": int(result.get("expected_status", status_code)),
            "keyword": result.get("keyword") or None,
            "keyword_present": bool(result.get("keyword_present", True)),
            "assertions": result.get("assertions") or [],
            "reasoning": str(result.get("reasoning", ""))[:150],
            "actual_status": status_code,
        }

    except json.JSONDecodeError as e:
        raise RuntimeError(f"AI returned invalid JSON: {e}")
    except RuntimeError:
        raise
    except Exception as e:
        import traceback
        print(f"[AI] analyze_endpoint error: {type(e).__name__}: {e}")
        print(traceback.format_exc())
        raise RuntimeError(f"AI analysis failed ({type(e).__name__}): {e}")
