#!/bin/bash

# Test script for running E2E tests against Vercel deployment
# Usage: ./scripts/test-vercel.sh [vercel-url]

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default Vercel URL
VERCEL_URL="${1:-https://synter-fresh.vercel.app}"

echo -e "${YELLOW}🚀 Testing Synter on Vercel${NC}"
echo -e "${YELLOW}URL: ${VERCEL_URL}${NC}"
echo ""

# Check if URL is accessible
echo -e "${YELLOW}📡 Checking if Vercel deployment is accessible...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "${VERCEL_URL}" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Deployment is accessible${NC}"
else
    echo -e "${RED}❌ Could not reach ${VERCEL_URL}${NC}"
    exit 1
fi

# Check if required env vars are set in Vercel (via test)
echo ""
echo -e "${YELLOW}🔍 Testing onboarding flow...${NC}"

# Set the base URL and run tests
export E2E_BASE_URL="${VERCEL_URL}"

# Run Playwright tests
echo ""
echo -e "${YELLOW}🎭 Running Playwright E2E tests...${NC}"
pnpm test:e2e

echo ""
echo -e "${GREEN}✨ All tests completed!${NC}"
echo -e "${GREEN}View detailed report: pnpm dlx playwright show-report${NC}"
