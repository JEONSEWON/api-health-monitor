"""
SQLAlchemy Database Models
"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base

# Use String(36) for SQLite compatibility instead of UUID
def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100))
    plan = Column(String(20), default="free")  # free, starter, pro, business
    stripe_customer_id = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    monitors = relationship("Monitor", back_populates="user", cascade="all, delete-orphan")
    alert_channels = relationship("AlertChannel", back_populates="user", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="user", uselist=False)


class Monitor(Base):
    """Monitor model - represents a URL/API to monitor"""
    __tablename__ = "monitors"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    url = Column(String(2048), nullable=False)
    method = Column(String(10), default="GET")  # GET, POST, PUT, DELETE
    interval = Column(Integer, default=300)  # seconds (5 minutes)
    timeout = Column(Integer, default=30)  # seconds
    headers = Column(JSON)  # custom headers
    body = Column(Text)  # for POST/PUT requests
    expected_status = Column(Integer, default=200)
    is_active = Column(Boolean, default=True)
    last_status = Column(String(20))  # up, down, degraded
    last_checked_at = Column(DateTime)
    next_check_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="monitors")
    checks = relationship("Check", back_populates="monitor", cascade="all, delete-orphan")
    alert_channels = relationship("AlertChannel", secondary="monitor_alert_channels", back_populates="monitors")


class Check(Base):
    """Check model - represents a single health check result"""
    __tablename__ = "checks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    monitor_id = Column(String(36), ForeignKey("monitors.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), nullable=False)  # up, down, degraded
    status_code = Column(Integer)
    response_time = Column(Integer)  # milliseconds
    error_message = Column(Text)
    checked_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    monitor = relationship("Monitor", back_populates="checks")


class AlertChannel(Base):
    """Alert Channel model - email, slack, telegram, etc."""
    __tablename__ = "alert_channels"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(20), nullable=False)  # email, slack, telegram, discord, webhook
    config = Column(JSON, nullable=False)  # channel-specific config
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="alert_channels")
    monitors = relationship("Monitor", secondary="monitor_alert_channels", back_populates="alert_channels")


class MonitorAlertChannel(Base):
    """Many-to-Many relationship between Monitors and AlertChannels"""
    __tablename__ = "monitor_alert_channels"
    
    monitor_id = Column(String(36), ForeignKey("monitors.id", ondelete="CASCADE"), primary_key=True)
    alert_channel_id = Column(String(36), ForeignKey("alert_channels.id", ondelete="CASCADE"), primary_key=True)


class Subscription(Base):
    """Subscription model - user's payment subscription"""
    __tablename__ = "subscriptions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    lemonsqueezy_subscription_id = Column(String(100), unique=True)
    plan = Column(String(20), nullable=False)  # free, starter, pro, business
    status = Column(String(20), nullable=False)  # active, canceled, past_due
    current_period_end = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="subscription")
