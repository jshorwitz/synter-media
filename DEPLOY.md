# Deployment Guide

## Railway Deployment

### 1. Project Setup
1. Connect this GitHub repo to Railway
2. Add MySQL service to your Railway project

### 2. Environment Variables
Set these in Railway dashboard:

**Database (from Railway MySQL service):**
```
DB_HOST=<mysql-service-host>
DB_PORT=3306
DB_USER=<mysql-username>
DB_PASSWORD=<mysql-password>
DB_NAME=<mysql-database>
```

**Application:**
```
PORT=8088
LOG_LEVEL=info
DRY_RUN=false
JWT_SECRET=<generate-random-secret>
SESSION_SECRET=<generate-random-secret>
```

**Redis (add Redis service):**
```
REDIS_URL=<redis-connection-url>
```

**Mock flags for initial deployment:**
```
MOCK_REDDIT=true
MOCK_TWITTER=true
MOCK_GOOGLE=false
```

### 3. Deploy Process
1. Railway will automatically build using `pnpm build && pnpm start`
2. After deployment, run migrations via Railway console:
   ```bash
   pnpm migrate
   ```

### 4. Verification
Visit `https://your-app.railway.app/health` - should return:
```json
{"ok": true, "db": true}
```

### 5. API Endpoints
- `GET /health` - Health check
- `POST /auth/signup` - User signup (stub)
- `POST /auth/login` - User login (stub)
- `GET /auth/me` - Current user (stub)
- `GET /agents/list` - Available agents
- `POST /agents/run` - Run agent (stub)

## Next Steps
1. Implement full auth system with Argon2id password hashing
2. Add BullMQ job queue system
3. Implement actual agents (Google Ads, Reddit, X)
4. Build dashboard UI
5. Add proper error handling and monitoring

## Architecture

```
synter/
├── packages/
│   ├── api/          # Express REST API
│   └── workers/      # Background job processors
├── migrations/       # Database schema
├── scripts/         # Deployment scripts
└── railway.toml     # Railway config
```

Current status: **Basic API scaffold deployed, ready for feature implementation**
