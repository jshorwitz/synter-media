#!/usr/bin/env python3
"""Standalone Synter FastAPI app."""

import os
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI application
app = FastAPI(
    title="Synter - AI Advertising Agency",
    description="Cross-channel ads management with AI agents",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_class=HTMLResponse)
async def homepage():
    """Homepage with Synter branding."""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Synter - AI Advertising Agency</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                margin: 0; padding: 40px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; min-height: 100vh;
                display: flex; align-items: center; justify-content: center;
            }
            .container { text-align: center; max-width: 800px; }
            h1 { font-size: 3rem; margin-bottom: 1rem; font-weight: 700; }
            .subtitle { font-size: 1.4rem; opacity: 0.9; margin-bottom: 2rem; font-weight: 300; }
            .status { 
                background: rgba(255,255,255,0.1); 
                padding: 30px; border-radius: 15px; 
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
            }
            .features { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                gap: 20px; 
                margin-top: 30px; 
            }
            .feature { 
                background: rgba(255,255,255,0.05); 
                padding: 20px; 
                border-radius: 10px; 
                border: 1px solid rgba(255,255,255,0.1);
            }
            .emoji { font-size: 2rem; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Synter</h1>
            <p class="subtitle">The AI Advertising Agency</p>
            <div class="status">
                <h3>✅ Successfully Deployed on Railway!</h3>
                <p>Cross-channel ads management with autonomous AI agents</p>
                
                <div class="features">
                    <div class="feature">
                        <div class="emoji">🎯</div>
                        <strong>Google Ads</strong><br>
                        Smart campaign optimization
                    </div>
                    <div class="feature">
                        <div class="emoji">🟠</div>
                        <strong>Reddit Ads</strong><br>
                        Community-driven targeting  
                    </div>
                    <div class="feature">
                        <div class="emoji">🐦</div>
                        <strong>X/Twitter Ads</strong><br>
                        Real-time engagement
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "synter"}

@app.get("/api/status")
async def api_status():
    """API status endpoint."""
    return {
        "service": "Synter - AI Advertising Agency",
        "status": "running",
        "version": "1.0.0",
        "message": "Cross-channel ads management with AI agents"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
