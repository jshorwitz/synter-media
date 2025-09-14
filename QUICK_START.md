# 🚀 Synter Quick Start

## 90-Second Railway Deployment

### 1. Setup Credentials (Local)
```bash
cd synter
pnpm install
pnpm setup  # Interactive credential setup
```

### 2. Deploy to Railway
```bash
pnpm railway:init  # Initializes Railway project
git add . && git commit -m "Initial deploy"
git push  # Railway auto-deploys!
```

### 3. Configure Railway Services
1. Go to your Railway dashboard
2. Add **MySQL** plugin (automatically provides DB credentials)
3. Add **Redis** plugin (automatically provides REDIS_URL)
4. Go to Variables tab → "Import from file" → upload `.env.example`
5. Edit the imported variables to add your real credentials
6. Hit "Deploy"

### 4. Verify Deployment
Visit: `https://your-railway-domain.railway.app/health`
Should return: `{"ok":true,"db":true}`

## Getting OAuth Credentials

### Google OAuth (User Login)
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create new OAuth 2.0 Client ID (Web application)
3. Add redirect URI: `https://your-railway-domain.railway.app/auth/google/callback`
4. Copy Client ID and Secret to Railway Variables

### Google Ads API (Campaign Data)
1. Go to [Google Ads API Center](https://ads.google.com/aw/apicenter)
2. Apply for basic access
3. Get developer token, client ID, secret, and refresh token
4. Copy all four values to Railway Variables

### OpenAI API (AI Features)
1. Go to [OpenAI API Keys](https://platform.openai.com/account/api-keys)
2. Create new secret key
3. Copy to Railway Variables

## Local Development
```bash
pnpm dev  # Runs API + workers with hot reload
```

## Common Commands
```bash
pnpm setup           # Interactive credential setup
pnpm dev             # Local development
pnpm build           # Build for production
pnpm railway:init    # Initialize Railway project
railway logs         # View deployment logs
railway run pnpm migrate  # Run database migrations
railway run pnpm seed     # Seed demo data
```

## Troubleshooting

**Build fails?**
- Check that all packages have valid `package.json` files
- Run `pnpm install` locally first

**Database connection fails?**
- Make sure MySQL plugin is added in Railway
- Check that `DB_HOST`, `DB_USER`, etc. are set correctly

**OAuth not working?**
- Verify redirect URIs match your Railway domain exactly
- Check that secrets are properly set in Railway Variables

**Still having issues?**
Run `railway logs` to see detailed error messages.
