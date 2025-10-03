#!/bin/bash
# Production Deployment Script for Synter

set -e

echo "🚀 Deploying Synter to Production..."

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found. Run this from the project root."
    exit 1
fi

# Check if we have required environment variables
if [ ! -f ".env" ]; then
    echo "📋 Creating .env from template..."
    cp .env.template .env
    echo "⚠️  Please edit .env with your actual values before deployment!"
fi

# Option 1: Local Docker Deployment
echo "📦 Option 1: Local Docker Production Deployment"
echo "   Run: docker-compose up --build -d"
echo ""

# Option 2: Railway Deployment
echo "🚂 Option 2: Railway Cloud Deployment"
echo "   1. Go to: https://railway.app/project/astonishing-reflection"
echo "   2. Connect GitHub repo: jshorwitz/synter"
echo "   3. Set environment variables (see .env.template)"
echo "   4. Deploy from main branch"
echo ""

# Option 3: Manual Railway via Git
echo "📡 Option 3: Deploy to Railway via Git Push"
echo "   The repository is already pushed to GitHub."
echo "   Railway will auto-deploy when connected to the repo."
echo ""

# List required services for production
echo "🏗️  Required Production Services:"
echo "   ✅ PostgreSQL Database (for auth, agent runs)"
echo "   ✅ Redis (for job queues)"  
echo "   ✅ BigQuery (for analytics data - external)"
echo "   ✅ PostHog (for event tracking - external SaaS)"
echo ""

# Environment setup checklist
echo "🔧 Environment Setup Checklist:"
echo "   [ ] POSTGRES_PASSWORD - Secure PostgreSQL password"
echo "   [ ] JWT_SECRET - 32+ character secret for JWT tokens"
echo "   [ ] SESSION_SECRET - 32+ character secret for sessions"
echo "   [ ] GOOGLE_ADS_* - Google Ads API credentials"
echo "   [ ] BIGQUERY_* - Google Cloud BigQuery configuration"
echo "   [ ] POSTHOG_API_KEY - PostHog project API key"
echo "   [ ] OPENAI_API_KEY - OpenAI API key for AI features"
echo ""

# Quick local test
echo "🧪 Quick Local Test (Docker):"
echo "   docker-compose up postgres redis"
echo "   # Wait for services to start"
echo "   docker-compose up orchestrator dashboard"
echo ""

echo "✅ Deployment preparation complete!"
echo "🌐 After deployment, your services will be available at:"
echo "   - Dashboard: https://your-domain.com (port 3000)"
echo "   - API: https://your-domain.com:3001 (orchestrator)"
echo "   - Health: https://your-domain.com:3001/health"
