# 🚀 Synter Media - AI Advertising Agency

Cross-platform ads management with autonomous agents for Google Ads, Reddit Ads, and X (Twitter) Ads.

## ✨ Features

- **🏠 Marketing Homepage** - Professional landing page with login/signup
- **📊 Analytics Dashboard** - Real-time campaign performance and KPIs  
- **🤖 AI Agents** - Autonomous campaign optimization and management
- **🔧 API Platform** - RESTful API for all operations
- **📈 Multi-Platform** - Google Ads, Reddit Ads, X (Twitter) integration
- **🎯 Attribution** - Cross-channel attribution and analytics

## 🚀 Quick Start

### Complete Launch (Recommended)
```bash
./launch-complete.sh
```

This will install all dependencies, build services, and start the complete application.

### Access Points
- **🏠 Homepage:** http://localhost:8000
- **📊 Dashboard:** http://localhost:8000/dashboard  
- **🔐 Login/Signup:** http://localhost:8000
- **📈 Traffic Analytics:** http://localhost:3000
- **🔧 API Health:** http://localhost:8000/health
- **📋 API Docs:** http://localhost:8000/docs

### Testing
```bash
./test-services.sh    # Test all running services
pnpm tokens:check     # Check API configurations
```

## 🎯 Test Account

Configured for **sourcegraph.com** across all advertising platforms:
- Google Ads campaigns
- Reddit Ads
- X (Twitter) Ads  
- Google Search Console

## 📚 Documentation

- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [AGENTS.md](./AGENTS.md) - Agent system documentation  
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - BigQuery migration guide
- [REDDIT_SETUP.md](./REDDIT_SETUP.md) - Reddit API setup guide

## 🏗️ Architecture

- **Frontend:** FastAPI + Jinja2 templates
- **Backend:** Node.js + TypeScript  
- **Database:** BigQuery (analytics) + PostgreSQL (auth)
- **Queue:** Redis for job processing
- **AI:** OpenAI integration for optimization
