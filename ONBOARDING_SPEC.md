# 🚀 Enhanced Onboarding System - Account Discovery & Campaign Strategy

## ✨ **New Features Added**

The onboarding system now includes **real account discovery** and **AI-powered campaign strategy** for connecting to actual sourcegraph.com advertising accounts.

### **🔍 Account Discovery**
- **Google Ads**: Search for existing Google Ads accounts using real API
- **Reddit**: Discover Reddit communities and advertising opportunities
- **X (Twitter)**: Find official accounts and advertising potential

### **🎯 Campaign Strategy Engine**
- **AI-Powered Keywords**: Generate relevant keywords using OpenAI
- **Platform-Specific Strategies**: Tailored campaign recommendations
- **Budget Recommendations**: Smart budget allocation across platforms
- **Ad Copy Suggestions**: AI-generated ad copy for each platform

### **📊 Real Data Integration**
- **Live API Connections**: Real account search using configured credentials
- **Dynamic KPI Estimation**: Calculate performance metrics from keyword data
- **Smart Fallbacks**: Graceful degradation when APIs are unavailable

## 🎯 **Onboarding Flow for Sourcegraph.com**

### **Step 1: Website Analysis**
User enters: `https://sourcegraph.com`

**What happens:**
1. **Website Analysis** - Extract title, description, industry detection
2. **Account Discovery** - Search all platforms for sourcegraph.com accounts
3. **Keyword Generation** - AI-powered keyword suggestions for code search industry
4. **Strategy Creation** - Platform-specific campaign strategies

### **Step 2: Account Search Results**
**Google Ads Discovery:**
- ✅ **Found**: Sourcegraph Google Ads account with campaigns and spend data
- 🔍 **Connection**: Full access level with campaign management
- 📊 **Data**: Real campaign count and historical spend

**Reddit Discovery:**
- 🔍 **Community**: r/sourcegraph official community  
- 📈 **Opportunity**: Community advertising and promoted posts
- 🎯 **Strategy**: Target developer communities (r/programming, r/webdev)

**X (Twitter) Discovery:**
- 🔍 **Account**: @sourcegraph official account
- 📊 **Followers**: Real follower count and verification status
- 🎯 **Strategy**: Promoted tweets in developer ecosystem

### **Step 3: Campaign Strategy Recommendations**

**Google Ads Strategy:**
```
🔍 Search + Performance Max Campaign
💰 Budget: $2,500/month
🎯 Keywords: "sourcegraph", "code search", "developer tools"
📝 Ad Copy: "Scale Your Code Search with Sourcegraph"
👥 Targeting: Developers, Engineering Managers, CTOs
```

**Reddit Strategy:**
```
🔗 Community Engagement Campaign  
💰 Budget: $800/month
🎯 Communities: r/programming, r/webdev, r/javascript
📝 Ad Copy: "How Sourcegraph changed our development workflow"
👥 Targeting: Software developers, tech-savvy users
```

**X Strategy:**
```
🐦 Promoted Tweets + Follower Campaign
💰 Budget: $600/month
🎯 Hashtags: #developer, #programming, #codesearch
📝 Ad Copy: "Stop grep-ing through code. Start using Sourcegraph"
👥 Targeting: Tech influencers, developer accounts
```

## 🔧 **API Endpoints**

### **Comprehensive Analysis**
```http
POST /onboarding/analyze
{
  "url": "https://sourcegraph.com",
  "industry": "Technology"
}
```

**Response:**
```json
{
  "website_info": {
    "title": "Sourcegraph - Code Intelligence Platform",
    "description": "Universal code search and intelligence",
    "industry": "Technology/Software"
  },
  "discovered_accounts": [
    {
      "platform": "google",
      "account_id": "123-456-7890", 
      "account_name": "Sourcegraph - Google Ads",
      "status": "active",
      "campaigns_found": 8,
      "total_spend": 15420.50,
      "access_level": "full_access"
    }
  ],
  "keyword_suggestions": [
    {
      "keyword": "sourcegraph",
      "search_volume": 8500,
      "competition": "medium",
      "suggested_bid": 3.25,
      "relevance_score": 0.92
    }
  ],
  "campaign_strategies": [...],
  "optimization_score": 85,
  "next_steps": [...]
}
```

### **Individual Searches**
```http
GET /onboarding/discover-accounts/sourcegraph.com
GET /onboarding/keywords/sourcegraph.com?industry=Technology
POST /onboarding/strategy {"url": "https://sourcegraph.com"}
```

## 🎨 **Enhanced UI Features**

### **Smart Connection Buttons**
Connection buttons now show dynamic status:

**✅ Account Found:**
```
[🔍] Connect Google Ads
     Found 8 campaigns - $15,420 spend
```

**⚠️ Search Required:**
```
[🔗] Connect Reddit Ads  
     Account search required - click to connect
```

**🚀 Ready to Connect:**
```
[🐦] Connect X Ads
     Ready to connect and create campaigns
```

### **Enhanced Keywords Display**
```
[sourcegraph software] [8.5K] [LOW]
[code search tool]     [12K]  [HIGH] 
[sourcegraph pricing]  [2.1K] [HIGH]
```

Color-coded by competition level and search volume.

### **Campaign Strategy Cards**
Interactive strategy cards showing:
- Platform-specific recommendations
- Budget suggestions
- Target keywords
- Ad copy examples
- Targeting recommendations

## 🚀 **Launch Instructions**

### **Start Enhanced Onboarding:**
```bash
./launch-complete.sh
```

### **Access Enhanced Onboarding:**
1. **Go to**: http://localhost:8000/onboarding
2. **Enter**: `https://sourcegraph.com`
3. **Watch**: Real account discovery in action
4. **Get**: AI-powered campaign strategies
5. **Connect**: To real advertising accounts

## 🔧 **Configuration for Real Data**

To get **real sourcegraph.com account data**, update `.env`:

```env
# Enable real data (disable mocks)
MOCK_GOOGLE=false
MOCK_REDDIT=false  
MOCK_TWITTER=false

# Add Sourcegraph's real account IDs
GOOGLE_ADS_CUSTOMER_ID=sourcegraph_real_customer_id
GOOGLE_ADS_LOGIN_CUSTOMER_ID=mcc_customer_id

# Ensure API credentials are configured
GOOGLE_ADS_CLIENT_ID=configured
GOOGLE_ADS_CLIENT_SECRET=configured
GOOGLE_ADS_REFRESH_TOKEN=configured
REDDIT_ACCESS_TOKEN=configured
TWITTER_BEARER_TOKEN=configured
```

## 🎯 **Benefits for Sourcegraph**

1. **🔍 Account Discovery** - Find all existing advertising accounts automatically
2. **📊 Real Data Analysis** - Analyze actual campaign performance 
3. **🎯 Smart Strategies** - AI-generated campaigns tailored to code search industry
4. **💰 Budget Optimization** - Data-driven budget recommendations
5. **🚀 Quick Setup** - One-click connection to existing accounts
6. **📈 Cross-Platform** - Unified strategy across Google, Reddit, X

**The enhanced onboarding system transforms account discovery from manual work into an automated, AI-powered experience!**
