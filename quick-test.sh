#!/bin/bash

echo "🧪 Quick Test - Synter with Real AI Persona Analysis"
echo "=================================================="

# Set local environment
export NODE_ENV=development
export DISABLE_BIGQUERY=true

# Copy local env
cp .env.local .env

echo "🤖 Starting Python AI services on port 8000..."
cd ai-adwords

# Setup Python environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install fastapi uvicorn jinja2 python-multipart openai

# Start AI services in background
uvicorn src.api.app:app --host 0.0.0.0 --port 8000 --reload &
AI_PID=$!

cd ..

echo "🌐 Starting frontend on port 3000..."
echo ""
echo "🎯 Test the REAL AI persona analysis flow:"
echo "1. Homepage: http://localhost:3000"  
echo "2. Enter URL: https://sourcegraph.com"
echo "3. Click 'Get Started'"
echo "4. Watch REAL AI analyze website & build personas"
echo "5. Select personas and create campaigns"
echo ""
echo "🤖 AI Services: http://localhost:8000"
echo "📋 API Docs: http://localhost:8000/docs"
echo ""

# Start frontend
cd apps/web
pnpm dev

# Cleanup on exit
trap "kill $AI_PID 2>/dev/null" EXIT
