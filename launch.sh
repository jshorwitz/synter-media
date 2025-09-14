#!/bin/bash

echo "🚀 Launching Synter - AI Advertising Agency"
echo "============================================="

echo ""
echo "📋 Checking environment..."
pnpm tokens:check

echo ""
echo "🔧 Building Node.js services..."
pnpm build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful! Starting full application..."
    echo ""
    
    # Use the comprehensive dashboard launcher
    ./start-dashboard.sh
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
