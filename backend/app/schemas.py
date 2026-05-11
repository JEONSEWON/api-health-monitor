"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, EmailStr, Field, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


# ============== Auth Schemas ==============

class UserRegister(BaseModel):
    """User registration request"""
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    name: Optional[str] = Field(None, max_length=100)


class UserLogin(BaseModel):
    """User login request"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    """Token refresh request — body token optional; falls back to HttpOnly cookie"""
    refresh_token: Optional[str] = None


class UserResponse(BaseModel):
    """User response"""
    id: UUID
    email: str
    name: Optional[str]
    plan: str
    is_active: bool
    onboarding_completed: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


# ============== Monitor Schemas ==============

class MonitorCreate(BaseModel):
    """Create monitor request"""
    name: str = Field(max_length=255)
    url: HttpUrl
    method: str = Field(default="GET", pattern="^(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH)$")
    interval: int = Field(default=300, ge=10, le=3600)  # 10s (Business) to 1 hour
    timeout: int = Field(default=30, ge=5, le=120)
    headers: Optional[Dict[str, str]] = None
    body: Optional[str] = None
    expected_status: int = Field(default=200, ge=100, le=599)
    monitor_type: str = Field(default="http", pattern="^(http|heartbeat)$")
    heartbeat_interval: Optional[int] = Field(None, ge=1, le=10080)  # 1 min to 1 week
    heartbeat_grace: Optional[int] = Field(None, ge=1, le=1440)
    keyword: Optional[str] = Field(None, max_length=500)
    keyword_present: bool = Field(default=True)
    use_regex: bool = Field(default=False)
    alert_threshold: int = Field(default=1, ge=1, le=10)


class MonitorUpdate(BaseModel):
    """Update monitor request"""
    name: Optional[str] = Field(None, max_length=255)
    url: Optional[HttpUrl] = None
    method: Optional[str] = Field(None, pattern="^(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH)$")
    interval: Optional[int] = Field(None, ge=10, le=3600)
    timeout: Optional[int] = Field(None, ge=5, le=120)
    headers: Optional[Dict[str, str]] = None
    body: Optional[str] = None
    expected_status: Optional[int] = Field(None, ge=100, le=599)
    heartbeat_interval: Optional[int] = Field(None, ge=1, le=10080)
    heartbeat_grace: Optional[int] = Field(None, ge=1, le=1440)
    keyword: Optional[str] = Field(None, max_length=500)
    keyword_present: Optional[bool] = None
    use_regex: Optional[bool] = None
    alert_threshold: Optional[int] = Field(None, ge=1, le=10)
    is_active: Optional[bool] = None


class AlertChannelBrief(BaseModel):
    """Brief alert channel info for monitor response"""
    id: UUID
    type: str
    config: Dict[str, str]
    is_active: bool

    class Config:
        from_attributes = True


class MonitorResponse(BaseModel):
    """Monitor response"""
    id: UUID
    name: str
    url: str
    method: str
    interval: int
    timeout: int
    headers: Optional[Dict[str, str]]
    body: Optional[str]
    expected_status: int
    monitor_type: str = "http"
    heartbeat_token: Optional[str] = None
    heartbeat_interval: Optional[int] = None
    heartbeat_grace: Optional[int] = None
    last_ping_at: Optional[datetime] = None
    keyword: Optional[str]
    keyword_present: bool
    use_regex: bool = False
    alert_threshold: int = 1
    consecutive_failures: int = 0
    is_active: bool
    last_status: Optional[str]
    last_checked_at: Optional[datetime]
    next_check_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    alert_channels: List[AlertChannelBrief] = []
    
    class Config:
        from_attributes = True


# ============== Check Schemas ==============

class CheckResponse(BaseModel):
    """Check response"""
    id: UUID
    monitor_id: UUID
    status: str
    status_code: Optional[int]
    response_time: Optional[int]
    error_message: Optional[str]
    checked_at: datetime
    ai_analysis: Optional[dict] = None

    class Config:
        from_attributes = True


class CheckListResponse(BaseModel):
    """List of checks with keyset pagination"""
    checks: List[CheckResponse]
    total: int
    page: int
    page_size: int
    next_cursor: Optional[str] = None


# ============== Alert Channel Schemas ==============

class AlertChannelCreate(BaseModel):
    """Create alert channel request"""
    type: str = Field(pattern="^(email|slack|telegram|discord|webhook)$")
    config: Dict[str, Any]


class AlertChannelUpdate(BaseModel):
    """Update alert channel request"""
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class AlertChannelResponse(BaseModel):
    """Alert channel response"""
    id: UUID
    type: str
    config: Dict[str, Any]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============== Subscription Schemas ==============

class CheckoutRequest(BaseModel):
    """Checkout request"""
    plan: str = Field(pattern="^(starter|pro|business)$")


class CheckoutResponse(BaseModel):
    """Checkout response"""
    checkout_url: str
    plan: str


class SubscriptionResponse(BaseModel):
    """Subscription response"""
    id: UUID
    plan: str
    status: str
    current_period_end: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============== Generic Responses ==============

class MessageResponse(BaseModel):
    """Generic message response"""
    message: str


class ErrorResponse(BaseModel):
    """Error response"""
    detail: str


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    timestamp: datetime


class MaintenanceWindowCreate(BaseModel):
    name: str = Field(..., max_length=255)
    repeat_type: str = Field(default="once", pattern="^(once|daily|weekly|monthly)$")
    weekday: Optional[int] = Field(None, ge=0, le=6)
    day_of_month: Optional[int] = Field(None, ge=1, le=31)
    start_time: str = Field(..., pattern="^([01][0-9]|2[0-3]):[0-5][0-9]$")
    end_time: str = Field(..., pattern="^([01][0-9]|2[0-3]):[0-5][0-9]$")
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    timezone: str = Field(default="UTC", max_length=50)
    monitor_ids: List[str] = []


class MaintenanceWindowResponse(BaseModel):
    id: UUID
    name: str
    repeat_type: str
    weekday: Optional[int]
    day_of_month: Optional[int]
    start_time: str
    end_time: str
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    timezone: str
    is_active: bool
    created_at: datetime
    monitor_ids: List[str] = []

    class Config:
        from_attributes = True


class AssertionCreate(BaseModel):
    assertion_type: str = Field(default="jsonpath", pattern="^(keyword|jsonpath|header)$")
    path: Optional[str] = None
    operator: str = Field(..., pattern="^(==|!=|>|>=|<|<=|contains|not_contains|is_null|is_not_null|exists)$")
    value: Optional[Any] = None
    logic: str = Field(default="AND", pattern="^(AND|OR)$")
    order: int = Field(default=0, ge=0)
    is_active: bool = True


class AssertionResponse(BaseModel):
    id: UUID
    assertion_type: str
    path: Optional[str]
    operator: str
    value: Optional[Any]
    logic: str
    order: int
    is_active: bool

    class Config:
        from_attributes = True


class AssertionTestRequest(BaseModel):
    response_body: str
    assertions: List[AssertionCreate]
    response_headers: Optional[dict] = None
