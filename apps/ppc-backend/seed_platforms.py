#!/usr/bin/env python3
"""Seed platforms table with supported ad platforms."""

import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

from models_vault import Base, Platform, PlatformType

load_dotenv()


def seed_platforms():
    """Seed the platforms table with initial data."""
    database_url = os.getenv("DATABASE_URL", "sqlite:///./ppc.db")
    engine = create_engine(database_url)
    
    Base.metadata.create_all(bind=engine)
    
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    platforms_data = [
        {
            "id": str(uuid.uuid4()),
            "name": PlatformType.GOOGLE_ADS,
            "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
            "token_url": "https://oauth2.googleapis.com/token",
            "scopes_default": ["https://www.googleapis.com/auth/adwords"],
            "api_base_url": "https://googleads.googleapis.com",
        },
        {
            "id": str(uuid.uuid4()),
            "name": PlatformType.MICROSOFT_ADS,
            "auth_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
            "token_url": "https://login.microsoftonline.com/common/oauth2/v2.0/token",
            "scopes_default": ["https://ads.microsoft.com/ads.manage", "offline_access"],
            "api_base_url": "https://api.bingads.microsoft.com",
        },
        {
            "id": str(uuid.uuid4()),
            "name": PlatformType.LINKEDIN_ADS,
            "auth_url": "https://www.linkedin.com/oauth/v2/authorization",
            "token_url": "https://www.linkedin.com/oauth/v2/accessToken",
            "scopes_default": ["r_ads", "r_ads_reporting", "rw_ads"],
            "api_base_url": "https://api.linkedin.com/rest",
        },
        {
            "id": str(uuid.uuid4()),
            "name": PlatformType.REDDIT_ADS,
            "auth_url": "https://www.reddit.com/api/v1/authorize",
            "token_url": "https://www.reddit.com/api/v1/access_token",
            "scopes_default": ["ads.read", "ads.write"],
            "api_base_url": "https://ads-api.reddit.com/api/v2.0",
        },
    ]
    
    for platform_data in platforms_data:
        existing = db.query(Platform).filter(Platform.name == platform_data["name"]).first()
        if not existing:
            platform = Platform(**platform_data)
            db.add(platform)
            print(f"✓ Added platform: {platform_data['name'].value}")
        else:
            print(f"- Platform already exists: {platform_data['name'].value}")
    
    db.commit()
    db.close()
    
    print("\n✅ Platform seeding complete!")


if __name__ == "__main__":
    seed_platforms()
