# 🧪 Testing Synter Locally - Complete Guide

## 🚀 **Quick Start (All Services)**

### **Option 1: One Command Start (Recommended)**
```bash
# Start original Python services + new Node.js services
./launch-complete.sh &
sleep 10
pnpm dev
```

### **Option 2: Manual Step-by-Step**

**Terminal 1 - Python AI Services**
```bash
cd ai-adwords
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.api.app:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Node.js API & Workers**
```bash
pnpm dev
# This starts: API (port 8088), Workers, and Web (port 3000)
```

**Terminal 3 - Traffic Dashboard (Optional)**
```bash
cd traffic-dashboard
npm start
```

---

## 🌐 **Access Points for Testing**

### **🎯 Main Application (New Design)**
- **Homepage:** http://localhost:3000
- **Launch Workflow:** http://localhost:3000/workflow  
- **Dashboard:** http://localhost:3000/dashboard
- **Login/Signup:** http://localhost:3000/auth

### **🔧 API Testing**
- **Workflow API:** http://localhost:8088/workflow/health
- **API Health:** http://localhost:8088/health
- **Original API:** http://localhost:8000/health
- **API Docs:** http://localhost:8000/docs

### **📊 Additional Tools**
- **Traffic Analytics:** http://localhost:3000 (if running separately)
- **Streamlit Dashboard:** Available through AI services

---

## 🧪 **Complete Workflow Testing**

### **1. Test the New Homepage**
1. Go to http://localhost:3000
2. ✅ **Check**: Dark theme with lime accents
3. ✅ **Check**: Two-column hero layout 
4. ✅ **Check**: D3.js visualization in right column
5. ✅ **Check**: Clean URL input without glyphs
6. ✅ **Check**: All sections load (Demo, Value Props, Features, Stats)

### **2. Test User Authentication**
1. Click **"Sign up"** in nav
2. ✅ **Check**: Auth modal opens
3. ✅ **Check**: Email/password signup works
4. ✅ **Check**: Magic link option available
5. ✅ **Check**: OAuth providers (Google, Reddit, X) present

### **3. Test the Complete Advertising Workflow**
1. **Login** and go to http://localhost:3000/workflow
2. **Enter website URL**: `https://sourcegraph.com`
3. **Select platforms**: Google, Meta, Reddit, X
4. **Set budget**: $1000
5. **Enable Dry Run**: Keep checked for testing
6. **Click**: "Launch Campaign Workflow"

**Expected Results:**
- ✅ **Step 1**: Website Analysis completes (AI extracts business info)
- ✅ **Step 2**: Campaign Generation (AI creates platform strategies)  
- ✅ **Step 3**: Campaign Launch (dry-run simulations)
- ✅ **Step 4**: Performance Setup (tracking initialization)
- ✅ **Final**: Results displayed with campaign details

### **4. Test Dashboard Integration**
1. Go to http://localhost:3000/dashboard
2. ✅ **Check**: KPI cards display
3. ✅ **Check**: Attribution table works
4. ✅ **Check**: Platform badges show brand colors
5. ✅ **Check**: "Launch Campaign" navigation works

### **5. Test API Endpoints Directly**

**Health Checks:**
```bash
curl http://localhost:8088/health
curl http://localhost:8000/health
curl http://localhost:8088/workflow/health
```

**Start Workflow via API:**
```bash
curl -X POST http://localhost:8088/workflow/start \
  -H "Content-Type: application/json" \
  -d '{
    "websiteUrl": "https://example.com",
    "platforms": ["google"],
    "budget": 500,
    "dryRun": true
  }'
```

**Check Workflow Status:**
```bash
# Replace WORKFLOW_ID with actual ID from start response
curl http://localhost:8088/workflow/WORKFLOW_ID/status
```

---

## 🔍 **Automated Testing Script**

Run the existing test script:
```bash
./test-services.sh
```

This checks:
- ✅ Port availability
- ✅ Service accessibility  
- ✅ API health endpoints
- ✅ Token configurations
- ✅ Database connectivity

---

## 🐛 **Troubleshooting Common Issues**

### **Port Conflicts**
```bash
# Check what's running on ports
lsof -i :3000 -i :8000 -i :8088

# Kill conflicting processes
kill -9 $(lsof -t -i:3000)
kill -9 $(lsof -t -i:8000)
```

### **Database Issues**
```bash
# Initialize database tables
pnpm db:init

# Check database connection
psql $DATABASE_URL -c "SELECT 1;"
```

### **Python Environment**
```bash
cd ai-adwords
python3 --version  # Should be 3.8+
source venv/bin/activate
pip list | grep -E "(fastapi|uvicorn|openai)"
```

### **Missing Dependencies**
```bash
# Reinstall Node.js packages
pnpm install

# Reinstall Python packages
cd ai-adwords
pip install -r requirements.txt
```

### **Environment Variables**
```bash
# Check tokens
pnpm tokens:check

# Verify environment file
cat .env | grep -E "(OPENAI|GOOGLE|REDDIT|TWITTER)"
```

---

## ✅ **Success Indicators**

### **Services Running:**
- ✅ Python AI services: http://localhost:8000/health returns `{"status": "ok"}`
- ✅ Node.js API: http://localhost:8088/health returns `{"ok": true}`  
- ✅ Next.js frontend: http://localhost:3000 loads homepage
- ✅ Workers: Background processes running without errors

### **Workflow Working:**
- ✅ Homepage loads with dark theme and proper layout
- ✅ URL input accepts websites and validates correctly
- ✅ "Get Started" redirects to onboarding or workflow
- ✅ Workflow launcher accessible at `/workflow`
- ✅ Complete workflow executes all 4 steps successfully
- ✅ Results display with platform-specific data

### **Integration Working:**
- ✅ Authentication system functions properly
- ✅ Dashboard shows real data
- ✅ Platform colors and badges display correctly
- ✅ No console errors in browser
- ✅ All API endpoints respond correctly

---

## 🎯 **Test Scenarios**

### **Scenario 1: New User Journey**
1. Visit homepage → Sign up → Complete workflow → View results

### **Scenario 2: Returning User**  
1. Login → Dashboard → Launch new campaign → Monitor progress

### **Scenario 3: API Integration**
1. Test all workflow API endpoints
2. Verify data persistence
3. Check error handling

### **Scenario 4: Platform Integration**
1. Test Google Ads integration (real/mock)
2. Test Reddit, Meta, X platform flows
3. Verify brand colors and styling

**Ready to test! Start with the Quick Start commands above and work through the test scenarios.** 🚀
