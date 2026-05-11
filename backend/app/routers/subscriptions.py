"""
Subscription management routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime
import hmac
import hashlib

from app.database import get_db
from app.models import User, Subscription, Monitor, WebhookLog
from app.schemas import SubscriptionResponse, MessageResponse
from app.auth import get_current_user
from app.lemonsqueezy import LemonSqueezyAPI, get_variant_id_for_plan
from app.config import get_settings
from app.routers.monitors import PLAN_LIMITS

settings = get_settings()
router = APIRouter(prefix="/subscription", tags=["Subscription"])

FREE_MONITOR_LIMIT = PLAN_LIMITS["free"]["max_monitors"]
FREE_MIN_INTERVAL = PLAN_LIMITS["free"]["min_interval"]


def enforce_plan_constraints(user: User, db: Session) -> None:
    """Enforce free plan constraints: monitor limit + minimum interval."""
    # Clamp intervals to free plan minimum
    monitors = db.query(Monitor).filter(Monitor.user_id == user.id).all()
    for m in monitors:
        if m.interval < FREE_MIN_INTERVAL:
            m.interval = FREE_MIN_INTERVAL
    db.commit()
    enforce_monitor_limit(user, db)


def enforce_monitor_limit(user: User, db: Session) -> int:
    """
    Deactivate excess monitors when a user is downgraded to free plan.
    Keeps the 10 most recently created monitors active, deactivates the rest.
    Returns the number of monitors deactivated.
    """
    active_monitors = (
        db.query(Monitor)
        .filter(Monitor.user_id == user.id, Monitor.is_active == True)
        .order_by(Monitor.created_at.asc())
        .all()
    )

    excess = len(active_monitors) - FREE_MONITOR_LIMIT
    if excess <= 0:
        return 0

    for monitor in active_monitors[:excess]:
        monitor.is_active = False

    db.commit()
    print(f"⬇️  Deactivated {excess} excess monitors for {user.email} (free plan limit)")
    return excess


@router.get("/", response_model=SubscriptionResponse)
def get_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's subscription
    """
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No subscription found"
        )
    
    return subscription


@router.post("/checkout")
def create_checkout(
    plan: str,
    billing: str = "monthly",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create checkout session for plan upgrade
    Args:
        plan: Target plan (starter, pro, business)
        billing: Billing cycle (monthly, annual)
    """
    if plan not in ["starter", "pro", "business"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan. Must be one of: starter, pro, business"
        )
    if billing not in ["monthly", "annual"]:
        billing = "monthly"

    # Check if user already has an active subscription
    existing_sub = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()

    if existing_sub and existing_sub.plan == plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You are already on the {plan} plan"
        )

    # Get variant ID for plan
    variant_id = get_variant_id_for_plan(plan, billing)
    if not variant_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Plan configuration error"
        )
    
    # Create checkout session
    try:
        lemon = LemonSqueezyAPI()
        checkout = lemon.create_checkout(
            variant_id=variant_id,
            email=current_user.email,
            custom_data={
                "user_id": str(current_user.id),
                "plan": plan
            }
        )
        
        # Extract checkout URL
        checkout_url = checkout["data"]["attributes"]["url"]
        
        return {
            "checkout_url": checkout_url,
            "plan": plan
        }
        
    except Exception as e:
        print(f"Checkout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create checkout session"
        )


@router.post("/cancel", response_model=MessageResponse)
def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel current subscription
    """
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription to cancel"
        )
    
    try:
        lemon = LemonSqueezyAPI()
        lemon.cancel_subscription(subscription.lemonsqueezy_subscription_id)

        # Mark as canceling — user keeps plan access until period ends
        subscription.status = "canceling"
        db.commit()

        period_end = subscription.current_period_end
        if period_end:
            end_str = period_end.strftime("%B %d, %Y")
            msg = f"Subscription will cancel on {end_str}. You'll keep full access until then."
        else:
            msg = "Subscription cancellation requested. You'll keep access until the current period ends."
        return {"message": msg}
        
    except Exception as e:
        print(f"Cancel error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel subscription"
        )


@router.post("/webhooks/lemonsqueezy")
async def lemonsqueezy_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle LemonSqueezy webhooks
    
    Events:
    - subscription_created
    - subscription_updated
    - subscription_cancelled
    - subscription_resumed
    - subscription_expired
    - subscription_paused
    - subscription_unpaused
    """
    # Verify webhook signature
    signature = request.headers.get("X-Signature")
    if not signature:
        print("⚠️ No signature in webhook")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No signature")
    
    # Read body (must read before JSON parsing)
    body = await request.body()
    
    # Verify signature
    if not settings.LEMONSQUEEZY_WEBHOOK_SECRET:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Webhook secret not configured")

    expected_signature = hmac.new(
        settings.LEMONSQUEEZY_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature, expected_signature):
        print(f"⚠️ Invalid signature: expected {expected_signature}, got {signature}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature"
        )
    
    # Parse webhook data from body
    import json
    data = json.loads(body.decode('utf-8'))
    
    event_name = data.get("meta", {}).get("event_name")
    subscription_data = data.get("data", {})
    attributes = subscription_data.get("attributes", {})
    custom_data = attributes.get("custom_data", {})
    
    print(f"📥 Webhook received: {event_name}")
    print(f"   Full data keys: {list(data.keys())}")
    print(f"   Attributes keys: {list(attributes.keys())}")
    print(f"   Custom data: {custom_data}")
    
    # Extract data
    user_id = custom_data.get("user_id")
    plan = custom_data.get("plan")
    lemonsqueezy_subscription_id = subscription_data.get("id")
    status_ls = attributes.get("status")
    ends_at = attributes.get("ends_at")
    user_email = attributes.get("user_email")
    variant_id = str(attributes.get("variant_id", ""))
    
    # Infer plan from variant_id if not in custom_data
    if not plan:
        from app.lemonsqueezy import PLAN_VARIANTS
        variant_to_plan = {v: k for k, v in PLAN_VARIANTS.items()}
        plan = variant_to_plan.get(variant_id, "starter")
        print(f"🔍 Inferred plan from variant {variant_id}: {plan}")
    
    # Try to find user by ID first, then by email
    user = None
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
    
    if not user and user_email:
        user = db.query(User).filter(User.email == user_email).first()
        print(f"🔍 Found user by email: {user_email}")
    
    if not user:
        print(f"⚠️  User not found (id: {user_id}, email: {user_email})")
        return {"message": "User not found"}
    
    # Handle different events
    processing_error = None
    try:
        if event_name == "subscription_created":
            existing_sub = db.query(Subscription).filter(
                Subscription.user_id == user.id
            ).first()

            if existing_sub:
                existing_sub.lemonsqueezy_subscription_id = lemonsqueezy_subscription_id
                existing_sub.plan = plan
                existing_sub.status = "active"
                existing_sub.current_period_end = datetime.fromisoformat(ends_at.replace("Z", "+00:00")) if ends_at else None
                print(f"🔄 Updated existing subscription for user {user.email}: {plan}")
            else:
                subscription = Subscription(
                    user_id=user.id,
                    lemonsqueezy_subscription_id=lemonsqueezy_subscription_id,
                    plan=plan,
                    status="active",
                    current_period_end=datetime.fromisoformat(ends_at.replace("Z", "+00:00")) if ends_at else None
                )
                db.add(subscription)
                print(f"✅ Subscription created for user {user.email}: {plan}")

            user.plan = plan
            db.commit()

        elif event_name == "subscription_updated":
            subscription = db.query(Subscription).filter(
                Subscription.lemonsqueezy_subscription_id == lemonsqueezy_subscription_id
            ).first()

            if subscription:
                subscription.status = status_ls
                subscription.current_period_end = datetime.fromisoformat(ends_at.replace("Z", "+00:00")) if ends_at else None

                if plan:
                    subscription.plan = plan
                    user.plan = plan

                db.commit()
                print(f"✅ Subscription updated for user {user.email}")

        elif event_name == "subscription_cancelled":
            subscription = db.query(Subscription).filter(
                Subscription.lemonsqueezy_subscription_id == lemonsqueezy_subscription_id
            ).first()

            if subscription:
                subscription.status = "canceling"
                subscription.current_period_end = datetime.fromisoformat(ends_at.replace("Z", "+00:00")) if ends_at else subscription.current_period_end
                db.commit()
                print(f"✅ Subscription canceling for user {user.email}, access until {subscription.current_period_end}")

        elif event_name == "subscription_expired":
            subscription = db.query(Subscription).filter(
                Subscription.lemonsqueezy_subscription_id == lemonsqueezy_subscription_id
            ).first()

            if subscription:
                subscription.status = "expired"
                db.commit()

                user.plan = "free"
                enforce_plan_constraints(user, db)
                print(f"✅ Subscription expired for user {user.email}, downgraded to free")

        elif event_name == "subscription_resumed":
            subscription = db.query(Subscription).filter(
                Subscription.lemonsqueezy_subscription_id == lemonsqueezy_subscription_id
            ).first()

            if subscription:
                subscription.status = "active"
                user.plan = subscription.plan
                db.commit()
                print(f"✅ Subscription resumed for user {user.email}")

    except Exception as e:
        processing_error = str(e)
        print(f"⚠️ Webhook processing error ({event_name}): {e}")
        db.rollback()

    # Persist webhook event for audit/debugging
    log = WebhookLog(
        event_name=event_name or "unknown",
        lemonsqueezy_subscription_id=str(lemonsqueezy_subscription_id) if lemonsqueezy_subscription_id else None,
        user_id=str(user.id) if user else None,
        payload=data,
        success=processing_error is None,
    )
    db.add(log)
    db.commit()

    if processing_error:
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {processing_error}")

    return {"message": "Webhook processed"}
