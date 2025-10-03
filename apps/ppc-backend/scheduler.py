"""
Background scheduler for automatic token refresh.

This module proactively refreshes OAuth tokens before they expire,
preventing API failures and ensuring continuous operation.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy import create_engine, and_
from sqlalchemy.orm import sessionmaker
import os

from models_vault import OAuthTokenVault, AdAccountConnection, ConnectionStatus
from services.token_service import TokenService

logger = logging.getLogger(__name__)


class TokenRefreshScheduler:
    """Manages scheduled token refresh jobs."""
    
    def __init__(self, database_url: str = None):
        self.database_url = database_url or os.getenv("DATABASE_URL")
        if not self.database_url:
            raise ValueError("DATABASE_URL not set")
        
        self.engine = create_engine(self.database_url)
        self.SessionLocal = sessionmaker(bind=self.engine)
        
        self.scheduler = AsyncIOScheduler()
        self._running = False
    
    async def refresh_expiring_tokens(self):
        """
        Proactively refresh tokens expiring within the next 30 minutes.
        
        This prevents token expiry during API operations and ensures
        continuous availability.
        """
        db = self.SessionLocal()
        
        try:
            threshold = datetime.utcnow() + timedelta(minutes=30)
            
            expiring_tokens = db.query(OAuthTokenVault).join(
                AdAccountConnection,
                OAuthTokenVault.ad_account_connection_id == AdAccountConnection.id
            ).filter(
                and_(
                    OAuthTokenVault.expires_at <= threshold,
                    OAuthTokenVault.revoked_at == None,
                    AdAccountConnection.status == ConnectionStatus.ACTIVE
                )
            ).all()
            
            if not expiring_tokens:
                logger.debug("No tokens need refresh at this time")
                return
            
            logger.info(f"Found {len(expiring_tokens)} tokens expiring soon, refreshing...")
            
            success_count = 0
            failure_count = 0
            
            for token in expiring_tokens:
                connection = token.ad_account_connection
                
                try:
                    logger.info(
                        f"Refreshing token for connection {connection.id} "
                        f"({connection.platform.name.value} - {connection.account_name})"
                    )
                    
                    await TokenService.get_valid_access_token(
                        db,
                        connection.id,
                        force_refresh=True
                    )
                    
                    success_count += 1
                    logger.info(f"✅ Refreshed token for {connection.account_name}")
                    
                except Exception as e:
                    failure_count += 1
                    logger.error(
                        f"❌ Failed to refresh token for {connection.account_name}: {e}",
                        exc_info=True
                    )
                
                await asyncio.sleep(0.5)
            
            logger.info(
                f"Token refresh batch complete: {success_count} succeeded, "
                f"{failure_count} failed"
            )
            
        except Exception as e:
            logger.error(f"Error in refresh_expiring_tokens: {e}", exc_info=True)
        finally:
            db.close()
    
    async def health_check_connections(self):
        """
        Perform health checks on all active connections.
        
        Identifies connections with issues and logs warnings.
        """
        db = self.SessionLocal()
        
        try:
            connections = db.query(AdAccountConnection).filter(
                AdAccountConnection.status == ConnectionStatus.ACTIVE
            ).all()
            
            issues = []
            
            for connection in connections:
                token = connection.oauth_tokens
                
                if not token:
                    issues.append(f"{connection.account_name}: No token found")
                    continue
                
                if token.revoked_at:
                    issues.append(f"{connection.account_name}: Token revoked")
                    continue
                
                if token.expires_at < datetime.utcnow():
                    issues.append(
                        f"{connection.account_name}: Token expired "
                        f"({token.refresh_attempts} refresh attempts)"
                    )
                
                if token.refresh_attempts >= 3:
                    issues.append(
                        f"{connection.account_name}: Multiple refresh failures "
                        f"({token.refresh_attempts} attempts)"
                    )
            
            if issues:
                logger.warning(
                    f"Health check found {len(issues)} connection issues:\n" +
                    "\n".join(f"  - {issue}" for issue in issues)
                )
            else:
                logger.info(f"Health check passed for {len(connections)} connections")
            
        except Exception as e:
            logger.error(f"Error in health_check_connections: {e}", exc_info=True)
        finally:
            db.close()
    
    async def cleanup_expired_connections(self):
        """
        Mark connections as EXPIRED if tokens have been expired for >7 days.
        """
        db = self.SessionLocal()
        
        try:
            expiry_threshold = datetime.utcnow() - timedelta(days=7)
            
            expired = db.query(AdAccountConnection).join(
                OAuthTokenVault,
                AdAccountConnection.id == OAuthTokenVault.ad_account_connection_id
            ).filter(
                and_(
                    AdAccountConnection.status == ConnectionStatus.ACTIVE,
                    OAuthTokenVault.expires_at < expiry_threshold,
                    OAuthTokenVault.revoked_at == None
                )
            ).all()
            
            if expired:
                for connection in expired:
                    connection.status = ConnectionStatus.EXPIRED
                    connection.status_message = "Token expired >7 days, requires re-authorization"
                    logger.warning(
                        f"Marked connection {connection.account_name} as EXPIRED"
                    )
                
                db.commit()
                logger.info(f"Marked {len(expired)} connections as EXPIRED")
            
        except Exception as e:
            logger.error(f"Error in cleanup_expired_connections: {e}", exc_info=True)
            db.rollback()
        finally:
            db.close()
    
    def start(self):
        """Start the scheduler with all jobs."""
        if self._running:
            logger.warning("Scheduler is already running")
            return
        
        self.scheduler.add_job(
            self.refresh_expiring_tokens,
            trigger=IntervalTrigger(minutes=10),
            id="refresh_tokens",
            name="Refresh expiring tokens",
            replace_existing=True,
            max_instances=1,
        )
        
        self.scheduler.add_job(
            self.health_check_connections,
            trigger=IntervalTrigger(hours=1),
            id="health_check",
            name="Connection health check",
            replace_existing=True,
            max_instances=1,
        )
        
        self.scheduler.add_job(
            self.cleanup_expired_connections,
            trigger=IntervalTrigger(hours=6),
            id="cleanup_expired",
            name="Cleanup expired connections",
            replace_existing=True,
            max_instances=1,
        )
        
        self.scheduler.start()
        self._running = True
        
        logger.info("🚀 Token refresh scheduler started")
        logger.info("  - Refresh expiring tokens: every 10 minutes")
        logger.info("  - Health check: every hour")
        logger.info("  - Cleanup expired: every 6 hours")
    
    def shutdown(self):
        """Gracefully shutdown the scheduler."""
        if not self._running:
            return
        
        logger.info("Shutting down scheduler...")
        self.scheduler.shutdown(wait=True)
        self._running = False
        logger.info("Scheduler stopped")
    
    def get_job_status(self) -> List[dict]:
        """Get status of all scheduled jobs."""
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                "id": job.id,
                "name": job.name,
                "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
                "trigger": str(job.trigger),
            })
        return jobs


_scheduler_instance = None


def get_scheduler() -> TokenRefreshScheduler:
    """Get the global scheduler instance."""
    global _scheduler_instance
    if _scheduler_instance is None:
        _scheduler_instance = TokenRefreshScheduler()
    return _scheduler_instance


async def start_scheduler():
    """Start the global scheduler (called at app startup)."""
    scheduler = get_scheduler()
    scheduler.start()


async def stop_scheduler():
    """Stop the global scheduler (called at app shutdown)."""
    scheduler = get_scheduler()
    scheduler.shutdown()
