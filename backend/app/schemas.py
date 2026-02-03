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
    """Token refresh request"""
    refresh_token: str


class UserResponse(BaseModel):
    """User response"""
    id: UUID
    email: str
    name: Optional[str]
    plan: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============== Monitor Schemas ==============

class MonitorCreate(BaseModel):
    """Create monitor request"""
    name: str = Field(max_length=255)
    url: HttpUrl
    method: str = Field(default="GET", pattern="^(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH)$")
    interval: int = Field(default=300, ge=60, le=3600)  # 1 min to 1 hour
    timeout: int = Field(default=30, ge=5, le=120)
    headers: Optional[Dict[str, str]] = None
    body: Optional[str] = None
    expected_status: int = Field(default=200, ge=100, le=599)


class MonitorUpdate(BaseModel):
    """Update monitor request"""
    name: Optional[str] = Field(None, max_length=255)
    url: Optional[HttpUrl] = None
    method: Optional[str] = Field(None, pattern="^(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH)$")
    interval: Optional[int] = Field(None, ge=60, le=3600)
    timeout: Optional[int] = Field(None, ge=5, le=120)
    headers: Optional[Dict[str, str]] = None
    body: Optional[str] = None
    expected_status: Optional[int] = Field(None, ge=100, le=599)
    is_active: Optional[bool] = None


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
    is_active: bool
    last_status: Optional[str]
    last_checked_at: Optional[datetime]
    next_check_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
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
    
    class Config:
        from_attributes = True


class CheckListResponse(BaseModel):
    """List of checks with pagination"""
    checks: List[CheckResponse]
    total: int
    page: int
    page_size: int


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
