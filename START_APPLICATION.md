# 🚀 Starting Synter - Complete Application Guide

This guide will help you start the entire Synter application with the new **unified workflow orchestrator** that connects all components.

## 📋 Prerequisites

### Required Software
- **Node.js 18+** and **pnpm** (for JavaScript/TypeScript services)
- **Python 3.8+** (for AI services and website analysis)
- **PostgreSQL** (for database)
- **Redis** (for job queues - optional but recommended)

### Environment Setup
Make sure you have a `.env` file in the root directory with:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/synter
POSTGRES_URL=postgresql://username:password@localhost:5432/synter

# External APIs
OPENAI_API_KEY=your_openai_key
GOOGLE_ADS_CLIENT_ID=your_google_ads_client_id
GOOGLE_ADS_CLIENT_SECRET=your_google_ads_client_secret
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token

# Reddit
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret

# Twitter/X
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# Service URLs (for development)
PPC_BACKEND_URL=http://localhost:8080
AI_AGENCY_API_URL=http://localhost:8000
DASHBOARD_URL=http://localhost:8501
```

---

## 🚀 Quick Start (Recommended)

### Option 1: Use the Existing Launch Script
```bash
# This starts the original services
chmod +x launch-complete.sh
./launch-complete.sh
```

### Option 2: Manual Step-by-Step Start

#### 1. Install Dependencies
```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies for AI services
cd ai-adwords
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

#### 2. Setup Database
```bash
# Initialize database tables (includes new workflow tables)
pnpm db:init
```

#### 3. Build Services
```bash
# Build all TypeScript packages
pnpm build
```

#### 4. Start All Services

**In separate terminals:**

**Terminal 1 - AI Services (Python)**
```bash
cd ai-adwords
source venv/bin/activate
uvicorn src.api.app:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - API Server (Node.js)**
```bash
pnpm -C packages/api dev
```

**Terminal 3 - Web Frontend (Next.js)**
```bash
pnpm -C apps/web dev
```

**Terminal 4 - Background Workers**
```bash
pnpm -C packages/workers dev
```

**Terminal 5 - Traffic Dashboard (Optional)**
```bash
cd traffic-dashboard
npm start
```

---

## 🌐 Access Points

Once all services are running, you can access:

### **Main Application**
- **🏠 Homepage:** http://localhost:3000
- **🚀 Launch Campaign Workflow:** http://localhost:3000/workflow
- **📊 Dashboard:** http://localhost:3000/dashboard  
- **🔐 Login/Signup:** http://localhost:3000/auth

### **API Services**
- **🔧 Workflow API:** http://localhost:8088/workflow
- **📋 API Health:** http://localhost:8088/health
- **🤖 AI Services:** http://localhost:8000/docs

### **Additional Tools**
- **📈 Traffic Analytics:** http://localhost:3000 (if traffic-dashboard is running)
- **🔍 API Documentation:** http://localhost:8000/docs

---

## 🎯 Testing the Complete Workflow

### 1. Access the Workflow Launcher
1. Go to http://localhost:3000
2. Sign up or log in
3. Navigate to "Launch Campaign" in the sidebar
4. Or directly visit: http://localhost:3000/workflow

### 2. Launch a Test Campaign
1. Enter a website URL (e.g., `https://sourcegraph.com`)
2. Select platforms (Google, Meta, Reddit, X)
3. Set budget (minimum $100)
4. Enable "Dry Run" for testing
5. Click "Launch Campaign Workflow"

### 3. Monitor Progress
The interface will show:
- **Real-time progress** of each step
- **Website Analysis** results (business info, personas)
- **Campaign Generation** (AI-created strategies)
- **Campaign Launch** status (with dry-run simulation)
- **Performance Setup** (tracking initialization)

### 4. API Testing
You can also test the API directly:

```bash
# Check health of all services
curl http://localhost:8088/workflow/health

# Start a workflow via API
curl -X POST http://localhost:8088/workflow/start \
  -H "Content-Type: application/json" \
  -d '{
    "websiteUrl": "https://sourcegraph.com",
    "platforms": ["google", "meta"],
    "budget": 1000,
    "dryRun": true
  }'

# Check workflow status (replace with actual workflow ID)
curl http://localhost:8088/workflow/WORKFLOW_ID/status
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Port Conflicts**
If ports are in use, you can change them:
- Next.js: `PORT=3001 pnpm -C apps/web dev`
- API: `PORT=8089 pnpm -C packages/api dev`
- Python: `uvicorn src.api.app:app --port 8001`

**2. Database Connection**
Ensure PostgreSQL is running and the DATABASE_URL is correct:
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1;"
```

**3. Python Virtual Environment**
Make sure the virtual environment is activated:
```bash
cd ai-adwords
source venv/bin/activate
python --version  # Should show Python 3.8+
```

**4. Missing Dependencies**
If you get import errors:
```bash
# Reinstall Node.js dependencies
pnpm install

# Reinstall Python dependencies
cd ai-adwords
pip install -r requirements.txt
```

### Health Checks
Check if all services are running:
```bash
# Node.js API
curl http://localhost:8088/health

# Python AI Services  
curl http://localhost:8000/health

# Workflow orchestrator
curl http://localhost:8088/workflow/health

# Next.js frontend
curl http://localhost:3000
```

---

## 📊 What You'll See

### 1. **Website Analysis** 
- Business information extraction
- Target persona identification  
- Competitor analysis
- Advertising readiness score

### 2. **Campaign Generation**
- AI-powered campaign strategies for each platform
- Platform-specific ad copy and targeting
- Budget recommendations and bid strategies

### 3. **Campaign Launch**
- Real Google Ads integration (in dry-run mode)
- Mock campaigns for Meta, Reddit, X
- Campaign ID tracking and status updates

### 4. **Performance Tracking**
- Initial metrics collection setup
- Performance monitoring dashboard
- Real-time campaign status updates

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ **All services start without errors**  
✅ **You can access the workflow launcher at http://localhost:3000/workflow**  
✅ **The workflow completes all 4 steps successfully**  
✅ **Campaign results are displayed with platform-specific data**  
✅ **Health checks return "healthy" status for all services**

---

## 🆘 Getting Help

If you run into issues:

1. **Check the logs** in each terminal window for error messages
2. **Run health checks** to see which services are failing  
3. **Verify environment variables** are set correctly
4. **Check database connectivity** with `pnpm db:init`
5. **Test individual components** before running the full workflow

The application now provides a **complete end-to-end advertising workflow** - from website analysis to campaign launch to performance tracking - all unified under a single, intuitive interface! 🚀
