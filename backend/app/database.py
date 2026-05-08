"""
Database connection and session management
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool
from typing import Generator

from app.config import get_settings

settings = get_settings()

# SQLite connect_args
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

is_postgres = not settings.DATABASE_URL.startswith("sqlite")

# Celery workers use NullPool to avoid stale connection issues across forks
_use_null_pool = os.environ.get("USE_NULLPOOL", "").lower() in ("1", "true")

if _use_null_pool:
    engine = create_engine(
        settings.DATABASE_URL,
        poolclass=NullPool,
    )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=is_postgres,
        pool_recycle=60 if is_postgres else -1,
        pool_size=5 if is_postgres else 5,
        max_overflow=10 if is_postgres else 0,
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session
    
    Usage:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database - create all tables"""
    Base.metadata.create_all(bind=engine)
