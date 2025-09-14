#!/bin/bash

echo "🧪 Testing Synter Services"
echo "=========================="

echo ""
echo "🔍 Checking port availability..."
lsof -i :8000 -i :3000 -i :8088 | head -10

echo ""
echo "🌐 Testing Homepage (port 8000)..."
curl -I http://localhost:8000 2>/dev/null && echo "✅ Homepage accessible" || echo "❌ Homepage not accessible"

echo ""
echo "📊 Testing Traffic Dashboard (port 3000)..." 
curl -I http://localhost:3000 2>/dev/null && echo "✅ Traffic Dashboard accessible" || echo "❌ Traffic Dashboard not accessible"

echo ""
echo "🔧 Testing API Health (port 8000)..."
curl -s http://localhost:8000/health | head -3 && echo "✅ API Health accessible" || echo "❌ API Health not accessible"

echo ""
echo "📋 Testing API Documentation..."
curl -I http://localhost:8000/docs 2>/dev/null && echo "✅ API Docs accessible" || echo "❌ API Docs not accessible"

echo ""
echo "🎯 Testing with Sourcegraph.com Configuration:"
echo "- Google Ads API: $(pnpm --silent tokens:check-google 2>/dev/null | grep -q 'OK' && echo '✅ Ready' || echo '❌ Needs Setup')"
echo "- OpenAI API: $(pnpm --silent tokens:check-openai 2>/dev/null | grep -q 'Connected' && echo '✅ Ready' || echo '❌ Needs Setup')"
echo "- Reddit API: $(pnpm --silent tokens:check-reddit 2>/dev/null | grep -q 'Connected' && echo '✅ Ready' || echo '❌ Needs Setup')"

echo ""
echo "📈 Service Status Summary:"
echo "=========================="
