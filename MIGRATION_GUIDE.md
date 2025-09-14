# BigQuery Migration Guide

This guide walks through migrating Synter from SingleStore/MySQL to a hybrid BigQuery + PostgreSQL setup.

## Architecture Overview

**Before:** SingleStore/MySQL + Redis
**After:** BigQuery (analytics) + PostgreSQL (auth) + Redis (queues)

### Why This Split?

- **BigQuery**: Perfect for analytics data (events, metrics, attribution) - handles massive scale, great for querying
- **PostgreSQL**: Perfect for transactional data (users, sessions, auth) - ACID compliance, foreign keys
- **Redis**: Still needed for job queues and session caching

## Migration Steps

### 1. Set Up BigQuery

1. Create a Google Cloud Project
2. Enable BigQuery API
3. Create a BigQuery dataset: `synter_analytics`
4. Create service account with BigQuery permissions
5. Download service account key JSON

### 2. Set Up PostgreSQL

For Railway:
1. Add PostgreSQL plugin to your Railway project
2. This provides `DATABASE_URL` automatically

For local development:
```bash
# Start PostgreSQL with Docker
docker run --name postgres -e POSTGRES_DB=synter -e POSTGRES_USER=synter_user -e POSTGRES_PASSWORD=synter_pass -p 5432:5432 -d postgres:15-alpine
```

### 3. Update Environment Variables

```env
# PostgreSQL for auth/transactional data
POSTGRES_URL=postgresql://synter_user:synter_pass@localhost:5432/synter

# BigQuery for analytics data
BIGQUERY_PROJECT_ID=your-gcp-project-id
BIGQUERY_DATASET=synter_analytics
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Redis for job queues (unchanged)
REDIS_URL=redis://localhost:6379
```

### 4. Install New Dependencies

```bash
# In both packages/api and packages/workers
pnpm add @google-cloud/bigquery pg
pnpm add -D @types/pg
```

### 5. Run Database Migrations

#### BigQuery Setup
```bash
# Run in BigQuery console
bq mk --dataset your-project:synter_analytics
bq query --use_legacy_sql=false < migrations/bigquery/001_init_bigquery.sql
bq query --use_legacy_sql=false < migrations/bigquery/002_views_bigquery.sql
```

#### PostgreSQL Setup
```bash
# Run PostgreSQL migrations
psql $POSTGRES_URL < migrations/postgresql/003_auth_postgres.sql
```

### 6. Data Migration

#### Export from SingleStore/MySQL
```sql
-- Export users and auth data
SELECT * FROM users INTO OUTFILE '/tmp/users.csv' FIELDS TERMINATED BY ',' ENCLOSED BY '"';
SELECT * FROM sessions INTO OUTFILE '/tmp/sessions.csv' FIELDS TERMINATED BY ',' ENCLOSED BY '"';
SELECT * FROM campaign_policies INTO OUTFILE '/tmp/campaign_policies.csv' FIELDS TERMINATED BY ',' ENCLOSED BY '"';

-- Export analytics data for BigQuery
SELECT * FROM events INTO OUTFILE '/tmp/events.csv' FIELDS TERMINATED BY ',' ENCLOSED BY '"';
SELECT * FROM ad_metrics INTO OUTFILE '/tmp/ad_metrics.csv' FIELDS TERMINATED BY ',' ENCLOSED BY '"';
SELECT * FROM conversions INTO OUTFILE '/tmp/conversions.csv' FIELDS TERMINATED BY ',' ENCLOSED BY '"';
SELECT * FROM touchpoints INTO OUTFILE '/tmp/touchpoints.csv' FIELDS TERMINATED BY ',' ENCLOSED BY '"';
```

#### Import to PostgreSQL
```bash
psql $POSTGRES_URL -c "\COPY users FROM '/tmp/users.csv' CSV HEADER"
psql $POSTGRES_URL -c "\COPY sessions FROM '/tmp/sessions.csv' CSV HEADER"
psql $POSTGRES_URL -c "\COPY campaign_policies FROM '/tmp/campaign_policies.csv' CSV HEADER"
```

#### Import to BigQuery
```bash
bq load --source_format=CSV --skip_leading_rows=1 synter_analytics.events /tmp/events.csv
bq load --source_format=CSV --skip_leading_rows=1 synter_analytics.ad_metrics /tmp/ad_metrics.csv
bq load --source_format=CSV --skip_leading_rows=1 synter_analytics.conversions /tmp/conversions.csv
bq load --source_format=CSV --skip_leading_rows=1 synter_analytics.touchpoints /tmp/touchpoints.csv
```

### 7. Update Application Code

The migration is mostly complete with the new database abstraction layer in:
- `packages/api/src/lib/database.ts`
- `packages/workers/src/lib/database.ts`

### 8. Test the Migration

```bash
# Update dependencies
pnpm install

# Build all packages
pnpm build

# Start services
docker-compose up postgres redis
pnpm dev
```

### 9. Deploy

For Railway deployment:

1. **Add PostgreSQL Plugin**: In Railway dashboard, add PostgreSQL plugin
2. **Update Environment Variables**: Add BigQuery credentials to Railway environment
3. **Deploy**: Push to trigger deployment

```bash
# Set environment variables in Railway
railway variables set BIGQUERY_PROJECT_ID=your-project-id
railway variables set BIGQUERY_DATASET=synter_analytics
railway variables set GOOGLE_APPLICATION_CREDENTIALS=$(cat service-account.json | base64)
```

## Data Flow After Migration

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Frontend      │────│     API      │────│   PostgreSQL    │
│   (Auth UI)     │    │   (Express)  │    │   (Users/Auth)  │
└─────────────────┘    └──────────────┘    └─────────────────┘
                              │
                              ├─────────────────────────────────┐
                              │                                 │
                    ┌──────────────┐                  ┌─────────────────┐
                    │    Redis     │                  │    BigQuery     │
                    │  (Job Queue) │                  │   (Analytics)   │
                    └──────────────┘                  └─────────────────┘
                              │                                 │
                    ┌──────────────┐                           │
                    │   Workers    │───────────────────────────┘
                    │  (ETL Jobs)  │
                    └──────────────┘
```

## Benefits of Migration

1. **Scalability**: BigQuery handles massive analytics datasets
2. **Cost**: Pay-per-query model for analytics, cheaper than always-on DB
3. **Performance**: Optimized for analytics queries and aggregations
4. **Reliability**: Managed services reduce operational overhead
5. **Analytics**: Native ML and advanced analytics capabilities

## Redis Cannot Be Replaced

Redis must remain because:
- **Job Queues**: Real-time messaging between API and workers
- **Session Storage**: Fast session lookups
- **Caching**: Performance-critical caching needs
- **Pub/Sub**: Real-time features

BigQuery is for analytics, not real-time operations.

## Rollback Plan

If migration fails:
1. Keep SingleStore running during migration
2. Switch database URLs back to MySQL
3. Applications will work as before
4. Clean up BigQuery resources

## Performance Considerations

- **BigQuery**: Optimized for batch operations, not real-time
- **PostgreSQL**: Use connection pooling for auth operations  
- **Redis**: Keep for all real-time/queue operations
- **Indexes**: Added appropriate indexes in PostgreSQL schema
