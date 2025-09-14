# Sourcegraph PPC Manager - Integration Guide

## Overview

I've successfully integrated the Sourcegraph PPC Manager into the existing Synter platform, creating a comprehensive Google Ads management and optimization system. This implementation follows the specifications from `sourcegraph-ppc-mvp-brief.md` and seamlessly integrates with the unified Synter application.

## 🏗️ Architecture

The PPC Manager consists of two main components:

### Backend (`apps/ppc-backend/`)
- **Framework**: FastAPI with Python 3.11
- **Database**: PostgreSQL with SQLAlchemy ORM
- **API Integration**: Google Ads API v14 with OAuth2
- **Key Features**:
  - Data ingestion via GAQL queries
  - ICP relevance scoring (0-100 scale)
  - Smart recommendation engine
  - Safe write operations with dry-run support
  - Complete audit logging

### Frontend (`apps/web/src/app/(dashboard)/ppc/`)
- **Framework**: Next.js with TypeScript
- **UI**: Tailwind CSS with shadcn/ui components
- **Pages**:
  - Dashboard overview with KPIs
  - Search Terms management
  - Recommendations engine
  - Audit log viewer

## 🚀 Quick Start

### 1. Start the PPC Backend

```bash
# Navigate to PPC backend
cd apps/ppc-backend

# Copy environment template
cp .env.example .env

# Edit .env with your Google Ads credentials
# Required: GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CLIENT_ID, etc.

# Start services with Docker
make dev
# Or: docker-compose up --build
```

### 2. Initial Data Setup

```bash
# Sync data from Google Ads (last 90 days)
make sync

# Run ICP scoring on keywords and search terms
make score

# Generate optimization recommendations
make recs

# Test recommendations with dry-run validation
make dryrun
```

### 3. Access the UI

The PPC Manager is integrated into the main Synter web application:

1. Start the Next.js app: `pnpm dev` (from `/apps/web/`)
2. Navigate to: `http://localhost:3000/ppc`
3. Login with admin/analyst role to access PPC features

## 📊 Features Implemented

### ✅ Core Data Ingestion
- **GAQL Queries**: Keywords, search terms, campaigns, metrics
- **Automated Sync**: Configurable schedules (every 2-4 hours)
- **Data Models**: Complete schema for campaigns, ad groups, keywords, search terms, metrics

### ✅ ICP Scoring System
- **Rule-based Scoring**: 0-100 scale based on Sourcegraph's ICP
- **Brand Detection**: +40 points for Sourcegraph-related terms
- **Include Terms**: +25 points for relevant tech terms (semantic code search, etc.)
- **Exclude Terms**: -30 points for irrelevant terms (tutorial, student, etc.)
- **Confidence Scoring**: Based on click volume and data quality

### ✅ Smart Recommendations Engine
1. **Negative Keywords**: Low ICP score (<40) + high spend (>$300) + no conversions
2. **Pause Keywords**: Poor performance + low ICP + below-average conversion rate  
3. **Budget Shifts**: Reallocate from low-fit to high-fit campaigns (±10-20%)

### ✅ Safe Operations
- **Dry-Run First**: All operations support `validate_only=true`
- **Policy Gates**: Minimum conversion thresholds, budget limits, approval requirements
- **Audit Logging**: Complete history of all operations with user tracking

### ✅ User Interface
- **Dashboard**: KPI overview, top waste terms, quick actions
- **Search Terms**: Filterable table with ICP scores and bulk actions
- **Recommendations**: Prioritized list with impact estimates and risk scores
- **Audit Log**: Complete operation history with detailed payload inspection

## 🔧 Configuration

### Google Ads API Setup

1. **Developer Token**: Get approved token from Google Ads
2. **OAuth2 Credentials**: Create client ID/secret in Google Cloud Console
3. **Refresh Token**: Generate using OAuth2 flow
4. **Customer IDs**: MCC (login) and target account IDs (digits only)

### Environment Variables

```env
# Google Ads API
GOOGLE_ADS_DEVELOPER_TOKEN=your_token
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_secret
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
GOOGLE_ADS_LOGIN_CUSTOMER_ID=1234567890
GOOGLE_ADS_CUSTOMER_ID=9876543210

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/synter_ppc

# Application
APP_BASIC_AUTH_USER=admin
APP_BASIC_AUTH_PASS=secure_password
```

## 🎯 ICP Scoring Details

### Sourcegraph's ICP Profile
- **Target Companies**: Mid-market & enterprise (200+ employees)
- **Personas**: VP Eng, Director Eng, Principal Engineers, DevX/Platform teams
- **Geos**: US, UK, DACH, AU/NZ, Nordics
- **Positive Signals**: Code search, AI coding assistant, semantic search, enterprise tooling
- **Negative Signals**: Student queries, tutorials, career/job hunting, "free" without "enterprise"

### Scoring Algorithm
```python
# Start at neutral (50)
score = 50

# Brand boost (+40)
if "sourcegraph" in term:
    score += 40

# Include term boost (+25)  
if any_match(["semantic code search", "enterprise code search", "code discovery"]):
    score += 25

# Exclude term penalty (-30)
if any_match(["tutorial", "student", "homework", "job"]):
    score -= 30

# Free/OSS penalty without enterprise (-15)
if ("free" in term or "open source" in term) and "enterprise" not in term:
    score -= 15

# Clamp to [0, 100]
score = max(0, min(100, score))

# Calculate confidence based on data volume
confidence = min(1.0, log10(clicks + 10) / 2)
```

## 📈 Recommendation Logic

### 1. Negative Keywords
**Trigger Conditions:**
- ICP score < 40 (poor fit)
- 7-day spend ≥ $300 (significant cost)
- 0 conversions (no value)

**Action:** Add campaign-level negative keyword (exact match)

### 2. Pause Keywords  
**Trigger Conditions:**
- ICP score < 50 (below average fit)
- 14-day spend ≥ $500 (high cost threshold)
- Conversion rate < account 25th percentile (poor performance)

**Action:** Pause ad group criterion

### 3. Budget Shifts
**Trigger Conditions:**
- High-fit campaigns (ICP ≥ 80) appear budget-constrained
- OR low-fit campaigns (ICP < 40) overspending vs. performance

**Action:** Suggest ±10-20% budget reallocation within guardrails

### Policy Safeguards
- **Data Sufficiency**: Require ≥20 conversions in last 30 days
- **Budget Minimums**: Never below $100/day per campaign
- **Change Limits**: >20% changes require manual approval
- **Dry-Run First**: All mutations default to validation mode

## 🔒 Security & Safety

### Authentication
- **Basic Auth**: MVP implementation (username/password)
- **Role-Based**: Admin/analyst access for PPC features
- **Audit Trail**: All actions logged with user attribution

### Safe-by-Default Operations
- **Validate-Only**: Default to dry-run for all write operations
- **Approval Workflow**: Large changes require explicit approval
- **Rollback Support**: Complete audit history enables change reversal
- **Error Handling**: Graceful degradation with detailed error logging

## 🔄 Integration Points

### With Existing Synter Platform
- **Authentication**: Uses existing user system and roles
- **Navigation**: Integrated into main sidebar (admin/analyst only)
- **UI Components**: Consistent with Synter design system
- **Database**: Separate PPC database, shared auth context

### With Google Ads API
- **OAuth2 Flow**: Secure token management with refresh
- **Rate Limiting**: Respects API quotas with exponential backoff
- **Error Handling**: Comprehensive Google Ads exception handling
- **Resource Management**: Proper connection pooling and cleanup

## 📊 API Endpoints

### Data Sync
- `POST /sync/full_sync` - Complete data refresh
- `GET /sync/keywords?days=90` - Sync keywords and metrics
- `GET /sync/search_terms?days=30` - Sync search terms

### ICP Scoring  
- `POST /score/icp?level=keyword&limit=1000` - Score keywords
- `GET /score/icp/stats` - Get scoring distribution
- `GET /score/icp/sample` - View scoring examples

### Recommendations
- `GET /recommendations/` - List recommendations
- `POST /recommendations/generate` - Generate new recommendations
- `PUT /recommendations/{id}/status` - Update status

### Operations
- `POST /apply/negative_keyword` - Add negative keyword
- `POST /apply/pause_keyword` - Pause keyword
- `POST /apply/adjust_budget` - Adjust budget
- `POST /apply/dry_run_all` - Bulk validation

### Audit & Monitoring
- `GET /audit/` - Audit log with filtering
- `GET /audit/summary` - Statistics and trends
- `GET /healthz` - Service health check

## 🛠️ Development

### Backend Development
```bash
cd apps/ppc-backend

# Setup virtual environment
make setup
source venv/bin/activate

# Run tests
make test

# Code quality
make lint
make typecheck

# Database reset
make db-reset
```

### Frontend Development
```bash
cd apps/web

# Install dependencies
pnpm install

# Start development server  
pnpm dev

# Type checking
pnpm type-check

# Build for production
pnpm build
```

## 🚦 Production Deployment

### Prerequisites
- Docker and docker-compose
- PostgreSQL database
- Google Ads API credentials
- SSL/TLS certificates

### Deployment Steps
1. **Environment Configuration**: Set production environment variables
2. **Database Setup**: Initialize PostgreSQL with proper security
3. **SSL/TLS**: Configure HTTPS for all endpoints
4. **Monitoring**: Set up health checks and alerting
5. **Backup Strategy**: Implement database and audit log backups

### Security Checklist
- [ ] Strong authentication passwords
- [ ] Google Ads credentials in secure vault
- [ ] Database connections encrypted
- [ ] API rate limiting configured
- [ ] Audit log retention policy
- [ ] Regular security updates

## 📋 Acceptance Criteria Status

### ✅ MVP Requirements Met
- [x] Google Ads API connection and OAuth2
- [x] Data ingestion (campaigns, keywords, search terms, metrics)
- [x] ICP scoring with Sourcegraph-specific rules
- [x] Recommendation engine (negative keywords, pauses, budget shifts)
- [x] Safe write operations with dry-run validation
- [x] Complete audit logging
- [x] Policy gates and approval workflows
- [x] Integrated UI in Synter platform

### ✅ Technical Requirements
- [x] FastAPI backend with PostgreSQL
- [x] Next.js frontend integration
- [x] Docker containerization
- [x] Comprehensive error handling
- [x] Rate limiting and retry logic
- [x] Complete API documentation
- [x] Unit and integration tests

## 🔮 Future Enhancements

### Phase 2 Features
- **Semantic Scoring**: ML-based ICP scoring with embeddings
- **Advanced Attribution**: Multi-touch attribution models
- **Automated Policies**: Rule-based auto-apply with constraints
- **Multi-Account**: MCC-level management for multiple accounts

### Integration Opportunities
- **GA4 Integration**: Enhanced conversion tracking
- **CRM Sync**: Lead quality feedback loop
- **Slack/Teams**: Real-time notifications
- **BigQuery**: Advanced analytics and reporting

## 📞 Support

### Common Issues
- **Authentication Errors**: Check developer token and OAuth credentials
- **Empty Data**: Verify customer ID permissions and date ranges  
- **Policy Blocks**: Review minimum thresholds and approval requirements

### Troubleshooting
```bash
# Check Google Ads connection
curl -u admin:password http://localhost:8000/auth/google_ads/status

# View recent audit logs  
curl -u admin:password http://localhost:8000/audit/summary

# Test API endpoints
make test-api
```

### Documentation
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Backend README**: `/apps/ppc-backend/README.md`
- **Codebase**: Well-commented with inline documentation

---

## Summary

The Sourcegraph PPC Manager is now fully integrated into the Synter platform, providing a comprehensive solution for Google Ads optimization tailored specifically for Sourcegraph's ICP and business objectives. The system combines intelligent automation with human oversight, ensuring safe and effective campaign management at scale.

**Key Benefits:**
- **Automated Optimization**: Intelligent recommendations based on ICP fit
- **Risk Mitigation**: Safe-by-default operations with comprehensive auditing  
- **Operational Efficiency**: Streamlined workflows with bulk operations
- **Data-Driven Decisions**: Clear insights into performance and opportunities
- **Scalable Architecture**: Built to handle enterprise-scale ad operations

The implementation is production-ready and includes all necessary safeguards, documentation, and monitoring capabilities for successful deployment.
