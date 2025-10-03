import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets
from contextlib import asynccontextmanager
from routers import sync, score, recommend, apply, audit, auth, integrations, oauth_callbacks, scheduler_status
from database import engine, init_db
from scheduler import start_scheduler, stop_scheduler


security = HTTPBasic()


def verify_credentials(credentials: HTTPBasicCredentials = Depends(security)):
    """Verify basic auth credentials."""
    correct_username = secrets.compare_digest(
        credentials.username, os.getenv("APP_BASIC_AUTH_USER", "admin")
    )
    correct_password = secrets.compare_digest(
        credentials.password, os.getenv("APP_BASIC_AUTH_PASS", "change-me")
    )
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and start scheduler on startup."""
    init_db()
    await start_scheduler()
    yield
    await stop_scheduler()


app = FastAPI(
    title="Sourcegraph PPC Manager",
    description="Google Ads management and optimization service for Sourcegraph",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://synter.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with auth dependency (except healthz and auth routes)
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(oauth_callbacks.router)
app.include_router(integrations.router, dependencies=[Depends(verify_credentials)])
app.include_router(scheduler_status.router, dependencies=[Depends(verify_credentials)])
app.include_router(sync.router, prefix="/sync", tags=["sync"], dependencies=[Depends(verify_credentials)])
app.include_router(score.router, prefix="/score", tags=["icp"], dependencies=[Depends(verify_credentials)])
app.include_router(recommend.router, prefix="/recommendations", tags=["recommendations"], dependencies=[Depends(verify_credentials)])
app.include_router(apply.router, prefix="/apply", tags=["apply"], dependencies=[Depends(verify_credentials)])
app.include_router(audit.router, prefix="/audit", tags=["audit"], dependencies=[Depends(verify_credentials)])


@app.get("/healthz", tags=["health"])
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "ppc-manager"}


@app.get("/", tags=["info"])
def root():
    """Root endpoint with service information."""
    return {
        "service": "Sourcegraph PPC Manager",
        "version": "1.0.0",
        "docs": "/docs"
    }
