#!/bin/bash

echo "🚀 Complete Synter Launch - AI Advertising Agency"
echo "================================================="

echo ""
echo "📋 Environment Check..."
pnpm tokens:check

echo ""
echo "🔧 Installing Python Dependencies..."
cd ai-adwords

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate and install dependencies
source venv/bin/activate
pip install fastapi uvicorn jinja2 python-multipart sqlalchemy asyncpg psycopg2-binary argon2-cffi pyjwt cryptography email-validator "python-jose[cryptography]" passlib

cd ..

echo ""
echo "🔧 Building Node.js Services..."
pnpm build

echo ""
echo "✅ Starting All Services..."

# Start FastAPI Homepage & API (port 8000)
echo "🌐 Starting Synter Homepage & API on port 8000..."
cd ai-adwords
source venv/bin/activate && uvicorn src.api.app:app --host 0.0.0.0 --port 8000 --reload &
HOMEPAGE_PID=$!
cd ..

# Wait a moment for the server to start
sleep 5

# Start Traffic Dashboard (port 3000)
echo "📊 Starting Traffic Dashboard on port 3000..."
cd traffic-dashboard
npm start &
DASHBOARD_PID=$!
cd ..

# Start Node.js Workers (now with BigQuery support)
echo "⚡ Starting Background Workers with BigQuery..."
pnpm -C packages/workers dev &
WORKERS_PID=$!

echo ""
echo "✅ All Services Started!"
echo ""
echo "🎯 Access Points:"
echo "=================="
echo "🏠 Synter Homepage: http://localhost:8000"
echo "📊 Dashboard: http://localhost:8000/dashboard"  
echo "🔐 Login/Signup: http://localhost:8000 (click buttons)"
echo "📈 Traffic Analytics: http://localhost:3000"
echo "🔧 API Health: http://localhost:8000/health"
echo "📋 API Documentation: http://localhost:8000/docs"
echo ""
echo "🧪 Test Configuration:"
echo "======================"
echo "Test account: sourcegraph.com"
echo "Platforms: Google Ads, Reddit Ads, X (Twitter) Ads"
echo "Analytics: BigQuery, OpenAI integration ready"
echo ""
echo "⌨️  Testing Commands:"
echo "pnpm tokens:check    # Check all API configurations"
echo "./test-services.sh   # Test all running services"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo 'Stopping all services...'; kill $HOMEPAGE_PID $DASHBOARD_PID $WORKERS_PID 2>/dev/null; exit" INT
wait
