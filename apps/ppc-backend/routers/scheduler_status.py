from fastapi import APIRouter, Depends
from typing import List, Dict
import logging

from scheduler import get_scheduler

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/scheduler", tags=["scheduler"])


@router.get("/status")
def get_scheduler_status():
    """Get the current status of the token refresh scheduler."""
    try:
        scheduler = get_scheduler()
        jobs = scheduler.get_job_status()
        
        return {
            "running": scheduler._running,
            "total_jobs": len(jobs),
            "jobs": jobs
        }
    except Exception as e:
        logger.error(f"Error getting scheduler status: {e}")
        return {
            "running": False,
            "error": str(e)
        }


@router.post("/refresh-now")
async def trigger_refresh_now():
    """Manually trigger token refresh for expiring tokens."""
    try:
        scheduler = get_scheduler()
        await scheduler.refresh_expiring_tokens()
        return {"status": "success", "message": "Token refresh triggered"}
    except Exception as e:
        logger.error(f"Error triggering refresh: {e}")
        return {"status": "error", "message": str(e)}


@router.post("/health-check-now")
async def trigger_health_check_now():
    """Manually trigger connection health check."""
    try:
        scheduler = get_scheduler()
        await scheduler.health_check_connections()
        return {"status": "success", "message": "Health check completed"}
    except Exception as e:
        logger.error(f"Error triggering health check: {e}")
        return {"status": "error", "message": str(e)}
