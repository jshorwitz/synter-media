# Database Cleanup & Consolidation Plan

## Current Database Status

### Identified Databases:
1. **PostgreSQL (Main - docker-compose.yml)** - `synter` database ✅ KEEP
2. **PostgreSQL (agents/google-python)** - `ai_adwords` database ❌ REMOVE
3. **SQLite (packages/settings/prisma/dev.db)** - Development only ❌ REMOVE
4. **SingleStore (docker-compose.yml)** - Unused service ❌ REMOVE
5. **MySQL references** - Legacy from multiple packages ❌ CLEAN UP

### BigQuery Integration:
- **BigQuery** - `synter_analytics` dataset ✅ KEEP (for analytics data)
- **PostHog** - External service ✅ KEEP (for event tracking)

---

## Consolidation Strategy

### ✅ FINAL ARCHITECTURE
```
Production Setup:
├── PostgreSQL (Auth, Transactional, Agent Management)
│   └── Database: synter
├── BigQuery (Analytics, Metrics, Attribution)  
│   └── Dataset: synter_analytics
└── PostHog (Event Tracking, Conversion Analytics)
    └── External SaaS
```

### ❌ TO REMOVE

#### 1. Duplicate PostgreSQL Setup
- **File**: `agents/google-python/docker-compose.yml`
- **Action**: Delete entire file
- **Reason**: Separate database for single agent is unnecessary

#### 2. SQLite Development Database  
- **File**: `packages/settings/prisma/dev.db`
- **Action**: Remove file, update schema to use PostgreSQL
- **Reason**: Should use same DB technology in dev/prod

#### 3. SingleStore Service
- **File**: Main `docker-compose.yml` (lines 3-14)
- **Action**: Remove SingleStore service and references
- **Reason**: Not being used, BigQuery serves analytics needs

#### 4. MySQL References
- **Files**: Multiple `package.json`, connection files
- **Action**: Remove mysql2 dependencies, replace with pg
- **Reason**: Standardize on PostgreSQL

---

## Migration Steps

### Phase 1: Clean Unused Services ⚡ IMMEDIATE
```bash
# Remove duplicate docker-compose
rm agents/google-python/docker-compose.yml

# Remove SQLite dev database
rm packages/settings/prisma/dev.db

# Update main docker-compose.yml (remove SingleStore)
```

### Phase 2: Package Cleanup 📦 
```bash
# Remove mysql2 from package.json files
pnpm remove mysql2

# Add PostgreSQL client where needed  
pnpm add pg @types/pg
```

### Phase 3: Schema Consolidation 🗃️
- Update `packages/settings/prisma/schema.prisma` to use PostgreSQL
- Migrate any `agents/google-python` tables to main PostgreSQL
- Ensure all agent runs use shared `synter.agent_runs` table

### Phase 4: Environment Variables 🔧
```bash
# Single PostgreSQL connection
POSTGRES_URL=postgresql://synter_user:synter_pass@postgres:5432/synter

# BigQuery for analytics
BIGQUERY_PROJECT_ID=your-gcp-project-id  
BIGQUERY_DATASET=synter_analytics

# PostHog for events
POSTHOG_API_KEY=phc_your_key
POSTHOG_HOST=https://us.posthog.com
```

---

## PostHog Integration Strategy

### Data Flow:
```mermaid
graph LR
    A[Google Ads] -->|API| B[Google Ads Agent]
    C[LinkedIn Ads] -->|API| D[LinkedIn Ads Agent]  
    E[Microsoft Ads] -->|API| F[Microsoft Ads Agent]
    
    B --> G[BigQuery synter_analytics]
    D --> G
    F --> G
    
    H[Website Visitors] -->|Events| I[PostHog]
    I -->|Conversion Data| J[PostHog-BigQuery Integrator]
    J --> G
    
    G --> K[Attribution Reports]
    K --> L[Dashboard]
```

### Integration Agent Benefits:
- **Unified Attribution**: Combine ad platform data with conversion events
- **Cross-Domain Tracking**: Track users from ads → landing → conversion
- **Real-time Sync**: Automated PostHog → BigQuery data pipeline
- **Advanced Analytics**: First-touch, last-touch, multi-touch attribution

---

## File Changes Required

### Remove Files:
- `agents/google-python/docker-compose.yml`
- `packages/settings/prisma/dev.db` 
- Any standalone MySQL connection files

### Update Files:
- `docker-compose.yml` (remove SingleStore)
- `packages/settings/prisma/schema.prisma` (PostgreSQL provider)
- All `package.json` files (remove mysql2, add pg if needed)
- Environment templates (consolidate DB vars)

### New Files:
- `agents/posthog-integration/index.js` ✅ CREATED
- `DATABASE_CONSOLIDATION_GUIDE.md` (this file)

---

## Verification Steps

### 1. Test Consolidated Setup
```bash
docker-compose up --build
# Should only start: postgres, redis, orchestrator, dashboard
```

### 2. Verify Database Connections
```bash
# All agents should use same PostgreSQL
psql postgresql://synter_user:synter_pass@localhost:5432/synter -c "\dt"
```

### 3. Test PostHog Integration
```bash
node agents/posthog-integration/index.js
# Should sync PostHog events to BigQuery
```

### 4. Verify BigQuery Integration
```bash 
# Should show synter_analytics dataset with tables:
# - ad_metrics, touchpoints, conversions
```

---

## Benefits After Cleanup

### ✅ Simplified Architecture
- Single PostgreSQL instance
- Clear separation: PostgreSQL (transactional) + BigQuery (analytics)  
- Unified environment variables

### ✅ Better Performance
- No database duplication
- Optimized for specific use cases
- Reduced resource usage

### ✅ Easier Maintenance
- Single source of truth for auth/transactional data
- Clear data flow: Events → PostHog → BigQuery
- Standardized tooling across all agents

### ✅ Enhanced Analytics  
- Complete attribution tracking
- Real-time conversion data
- Cross-platform insights via PostHog + BigQuery integration
