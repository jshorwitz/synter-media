#!/bin/bash

echo "🚀 Starting Synter Production Services"
echo "======================================"

# Set production environment
export NODE_ENV=production

# Build all services
echo "📦 Building services..."
pnpm build

# Initialize database 
echo "🗄️  Initializing database..."
pnpm db:init

# Start all services in production mode
echo "🌐 Starting services..."

# Start Python AI services (background)
cd ai-adwords
if [ -d "venv" ]; then
    source venv/bin/activate
else
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
fi

uvicorn src.api.app:app --host 0.0.0.0 --port ${PORT:-8000} &
AI_PID=$!
cd ..

# Start API server (background)
pnpm -C packages/api start &
API_PID=$!

# Start workers (background)  
pnpm -C packages/workers start &
WORKERS_PID=$!

# Start Next.js frontend (foreground)
echo "✅ All background services started"
echo "🌐 Starting frontend on port ${PORT:-3000}"

# Give background services time to start
sleep 5

# Health check
echo "🔍 Health check..."
curl -f http://localhost:${PORT:-8088}/health || echo "API not ready yet"
curl -f http://localhost:${PORT:-8000}/health || echo "AI services not ready yet"

# Start frontend (this keeps the container alive)
pnpm -C apps/web start

# Cleanup on exit
trap "echo 'Stopping services...'; kill $AI_PID $API_PID $WORKERS_PID 2>/dev/null; exit" INT TERM
wait
