#!/bin/bash

echo "🚀 Synter Quick Local Start"
echo "============================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating local .env file..."
    cp .env.local .env
    echo "✅ Local environment configured"
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🔧 Building services..."
pnpm build

echo "✅ Starting Synter in development mode..."
echo ""
echo "🌐 Access points:"
echo "- Homepage: http://localhost:3000"
echo "- Workflow: http://localhost:3000/workflow"
echo "- Dashboard: http://localhost:3000/dashboard"
echo ""
echo "📝 Note: Running in MOCK mode (no real API calls)"
echo "   To test with real APIs, run: pnpm setup"
echo ""

# Start all services
pnpm dev
