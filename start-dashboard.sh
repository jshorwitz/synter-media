#!/bin/bash

echo "🚀 Starting Synter - AI Advertising Agency"
echo "==========================================="

echo ""
echo "🔧 Checking environment configuration..."
pnpm tokens:check

echo ""
echo "🌐 Starting Synter Homepage & API on port 8000..."
cd ai-adwords
source venv/bin/activate && python start_app.py &
HOMEPAGE_PID=$!

cd ..

echo "📊 Starting Traffic Dashboard on port 3000..."
cd traffic-dashboard
npm start &
DASHBOARD_PID=$!

cd ..

echo "⚡ Starting Node.js Workers on Redis queue..."
pnpm -C packages/workers dev &
WORKERS_PID=$!

echo ""
echo "✅ All Services Starting..."
echo ""
echo "🏠 Synter Homepage: http://localhost:8000"
echo "📊 Dashboard: http://localhost:8000/dashboard"
echo "🔐 Login/Signup: http://localhost:8000 (click buttons)"
echo "📈 Traffic Dashboard: http://localhost:3000" 
echo "🔧 API Health: http://localhost:8000/health"
echo "📋 API Docs: http://localhost:8000/docs"
echo ""
echo "🎯 Test Account Configuration: sourcegraph.com"
echo "✅ Google Ads • BigQuery • OpenAI • Reddit configured"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo 'Stopping all services...'; kill $HOMEPAGE_PID $DASHBOARD_PID $WORKERS_PID; exit" INT
wait
