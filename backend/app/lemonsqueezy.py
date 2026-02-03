"""
LemonSqueezy API integration
"""

import requests
from typing import Dict, Any, Optional
from app.config import get_settings

settings = get_settings()


class LemonSqueezyAPI:
    """LemonSqueezy API client"""
    
    BASE_URL = "https://api.lemonsqueezy.com/v1"
    
    def __init__(self):
        self.api_key = settings.LEMONSQUEEZY_API_KEY
        self.store_id = settings.LEMONSQUEEZY_STORE_ID
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/vnd.api+json",
            "Content-Type": "application/vnd.api+json"
        }
    
    def _request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Make API request"""
        url = f"{self.BASE_URL}/{endpoint}"
        
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=self.headers,
                json=data,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"LemonSqueezy API error: {e}")
            raise
    
    def create_checkout(
        self,
        variant_id: str,
        email: str,
        custom_data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Create a checkout session
        
        Args:
            variant_id: Product variant ID from LemonSqueezy
            email: Customer email
            custom_data: Additional data (e.g., user_id)
        
        Returns:
            Checkout session data with URL
        """
        data = {
            "data": {
                "type": "checkouts",
                "attributes": {
                    "checkout_data": {
                        "email": email,
                        "custom": custom_data or {}
                    }
                },
                "relationships": {
                    "store": {
                        "data": {
                            "type": "stores",
                            "id": self.store_id
                        }
                    },
                    "variant": {
                        "data": {
                            "type": "variants",
                            "id": variant_id
                        }
                    }
                }
            }
        }
        
        return self._request("POST", "checkouts", data)
    
    def get_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Get subscription details"""
        return self._request("GET", f"subscriptions/{subscription_id}")
    
    def cancel_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Cancel a subscription"""
        return self._request("DELETE", f"subscriptions/{subscription_id}")
    
    def update_subscription(
        self,
        subscription_id: str,
        variant_id: Optional[str] = None,
        pause: Optional[bool] = None
    ) -> Dict[str, Any]:
        """
        Update subscription (change plan or pause)
        
        Args:
            subscription_id: LemonSqueezy subscription ID
            variant_id: New variant ID (for plan changes)
            pause: Pause/unpause subscription
        """
        data = {"data": {"type": "subscriptions", "id": subscription_id, "attributes": {}}}
        
        if variant_id:
            data["data"]["relationships"] = {
                "variant": {
                    "data": {
                        "type": "variants",
                        "id": variant_id
                    }
                }
            }
        
        if pause is not None:
            data["data"]["attributes"]["pause"] = pause
        
        return self._request("PATCH", f"subscriptions/{subscription_id}", data)
    
    def get_customer(self, customer_id: str) -> Dict[str, Any]:
        """Get customer details"""
        return self._request("GET", f"customers/{customer_id}")


# Plan to Variant ID mapping (configure these after creating products in LemonSqueezy)
PLAN_VARIANTS = {
    "starter": "123456",  # Replace with actual LemonSqueezy variant IDs
    "pro": "123457",
    "business": "123458"
}


def get_variant_id_for_plan(plan: str) -> Optional[str]:
    """Get LemonSqueezy variant ID for a plan"""
    return PLAN_VARIANTS.get(plan)
