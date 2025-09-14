# 🔍 Competitor Keyword Research Setup

## 🎯 **Current Status**

**✅ SEMrush & Ahrefs integrations already built** in the Python AI services, but need API keys to work.

**Right now:** Using **enhanced mock competitor keywords** based on domain and industry analysis.

**With API keys:** Will pull **real competitor data** from SEMrush/Ahrefs APIs.

---

## 🔧 **Add Real Competitor Research**

### **Option 1: SEMrush (Recommended)**

**1. Get SEMrush API Access:**
- Go to https://www.semrush.com/api-documentation/
- Sign up for SEMrush account
- Get API key from your account dashboard

**2. Add to Environment:**
```bash
# Add to .env.local
SEMRUSH_API_KEY=your-semrush-api-key-here
```

**3. Restart Services:**
```bash
./quick-test.sh
```

**What You'll Get:**
- ✅ **Real competitor ad copy** from competitors
- ✅ **Actual search volumes** for keywords
- ✅ **Competitor keyword gaps** and opportunities
- ✅ **Ad positioning data** from real campaigns
- ✅ **Traffic estimates** and cost-per-click data

### **Option 2: Ahrefs**

**1. Get Ahrefs API Access:**
- Go to https://ahrefs.com/api
- Sign up for Ahrefs account with API access
- Get API key from account settings

**2. Add to Environment:**
```bash
# Add to .env.local  
AHREFS_API_KEY=your-ahrefs-api-key-here
```

**What You'll Get:**
- ✅ **Keyword difficulty scores**
- ✅ **Backlink competitor analysis**
- ✅ **Content gap analysis**
- ✅ **Organic keyword opportunities**

---

## 🚀 **Enhanced Mock Data (Current)**

**Without API keys**, the system now generates **intelligent competitor keywords** based on:

### **Industry-Specific Analysis:**
- **Technology**: enterprise software, cloud platform, SaaS solution
- **E-commerce**: online store, payment processing, retail software  
- **Finance**: fintech solution, financial software, payment platform
- **Healthcare**: healthcare software, telemedicine, health tech
- **Education**: edtech platform, learning management, online education

### **Domain-Specific Research:**
- **Brand alternatives**: "best [domain] alternative"
- **Competitive comparisons**: "[domain] vs competitors"  
- **Market research**: "[domain] pricing", "[domain] reviews"
- **Category leaders**: "top [industry] platforms"

### **Example for Sourcegraph:**
```javascript
competitorKeywords: [
  'github enterprise',
  'code analysis tools', 
  'developer productivity platform',
  'code review software',
  'enterprise git',
  'code intelligence platform',
  'best sourcegraph alternative',
  'sourcegraph vs competitors'
]
```

---

## 💰 **API Costs (Optional)**

### **SEMrush:**
- **Guru Plan**: $229/month - includes 3,000 API units
- **Business Plan**: $449/month - includes 5,000 API units
- **Per-request cost**: ~$0.08-0.15 per keyword research

### **Ahrefs:**  
- **Lite Plan**: $129/month - includes 500 API units
- **Standard Plan**: $249/month - includes 2,000 API units
- **Per-request cost**: ~$0.25-0.50 per keyword batch

### **Free Alternative:**
The **enhanced mock system** provides realistic competitor keywords without API costs - perfect for testing and demos!

---

## 🧪 **How to Test Competitor Research**

### **Current Enhanced Mock:**
```bash
./quick-test.sh
# Enter any website URL
# See realistic competitor keywords in analysis
```

### **With SEMrush API:**
```bash
# Add SEMRUSH_API_KEY to .env.local
./quick-test.sh  
# Competitor keywords will come from real SEMrush data
```

### **Verify Real API Usage:**
Check Python service logs for:
```bash
INFO: SEMrush API call initiated for domain: example.com
INFO: Retrieved 47 competitor keywords from SEMrush
```

---

## 🎯 **What's Already Built**

Your existing Python services (`ai-adwords/src/intelligence/ad_intelligence.py`) include:

✅ **SEMrush API client** - Full domain advertising research  
✅ **Ahrefs API client** - Keyword difficulty and backlink analysis  
✅ **Facebook Ads Library** - Competitor ad copy discovery  
✅ **Organic competitor analysis** - Search result competitive intelligence  
✅ **Mock data generators** - Realistic fallbacks when APIs unavailable

---

## 🚀 **Recommendation**

**For now:** The enhanced mock competitor keywords are **very realistic** and perfect for demos and testing.

**For production:** Add SEMrush API key to get **real competitor intelligence** that will make your personas and keyword targeting even more accurate.

**The existing integration is already built and ready** - you just need to add the API key to unlock real competitor research! 🔍✨
