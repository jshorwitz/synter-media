#!/bin/bash

echo "🚀 Starting Synter Frontend Only (No External Dependencies)"
echo "==========================================================="

# Set local development environment
export NODE_ENV=development
export DISABLE_BIGQUERY=true
export MOCK_GOOGLE=true
export MOCK_REDDIT=true
export MOCK_TWITTER=true

# Copy local env
cp .env.local .env

echo "📦 Installing dependencies..."
pnpm install

echo "🔧 Building frontend..."
pnpm -C apps/web build

echo "🌐 Starting Next.js frontend..."
echo ""
echo "Access points:"
echo "- Homepage: http://localhost:3000"
echo "- Workflow: http://localhost:3000/workflow"
echo "- Dashboard: http://localhost:3000/dashboard"
echo ""
echo "Note: Running frontend only - workflow will use mock data"
echo ""

# Start only the frontend
pnpm -C apps/web dev
