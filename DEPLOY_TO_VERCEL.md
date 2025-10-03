# Deploy to Vercel - Manual Steps

The CLI deployment has a configuration issue. Follow these steps to deploy through the Vercel dashboard:

## Step 1: Go to Vercel Dashboard

Visit: https://vercel.com/new

## Step 2: Import Repository

1. Click "Import Git Repository"
2. Select your GitHub account
3. Find and import: `jshorwitz/synter`
4. Click "Import"

## Step 3: Configure Project Settings

### Framework Preset
- **Framework:** Next.js (auto-detected)

### Root Directory
**IMPORTANT:** Set this to: `apps/web`

### Build Settings
- **Build Command:** `next build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

### Node.js Version
- **Version:** 20.x

## Step 4: Add Environment Variables

Click "Environment Variables" and add these:

### Required for All Environments (Production, Preview, Development)

```bash
# JWT for auth
JWT_SECRET=<generate-random-64-char-string>

# App URL (update with your Vercel domain after first deploy)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Required for Backend Integration

```bash
# Your FastAPI backend URL (Railway/Render)
PPC_BACKEND_URL=https://your-backend.railway.app
PPC_BACKEND_BASIC_USER=admin
PPC_BACKEND_BASIC_PASS=<your-backend-password>
```

### Optional: OpenAI (for AI recommendations)

```bash
OPENAI_API_KEY=sk-...
```

### Optional: Database (if using Prisma features)

```bash
# Use a pooled connection for serverless
DATABASE_URL=postgresql://user:pass@host:5432/db?pgbouncer=true
```

### Optional: Email (for magic links)

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=<your-smtp-password>
FROM_EMAIL=noreply@yourdomain.com
```

## Step 5: Deploy

1. Review settings
2. Click "Deploy"
3. Wait 2-3 minutes for build

## Step 6: Verify Deployment

Once deployed, visit your Vercel URL and test:

- [ ] Homepage loads
- [ ] Login/signup works
- [ ] Dashboard accessible
- [ ] Settings page loads
- [ ] Campaign creation flow works
- [ ] OAuth apps management works

## Step 7: Update App URL

After first deployment:

1. Copy your Vercel URL (e.g., `web-xxx.vercel.app`)
2. Go to Project Settings → Environment Variables
3. Update `NEXT_PUBLIC_APP_URL` to your actual domain
4. Redeploy (or wait for next commit)

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as shown
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

## Common Issues

### Build fails with "Module not found"
- Solution: Ensure all dependencies in package.json
- Check: `@radix-ui/react-label`, `openai`, `nanoid` are installed

### "Prisma Client not generated"
- Solution: Should auto-run with postinstall script
- Verify package.json has: `"postinstall": "prisma generate"`

### OAuth redirects fail
- Solution: Update redirect URIs in platform developer consoles
- Format: `https://your-domain.vercel.app/auth/{platform}/callback`

### "Too many database connections"
- Solution: Use connection pooling
- Update DATABASE_URL with `?pgbouncer=true` or use Prisma Accelerate

## What's Deployed

✅ **Complete unified UI**
- Onboarding flow
- Campaign creation with AI
- Credential vault management
- Settings with OAuth apps
- Dashboard and analytics

✅ **All fixes applied**
- vercel.json simplified
- Session cookies standardized
- Missing components added
- Merge conflicts resolved
- Build errors fixed

✅ **Production-ready**
- Error handling
- Loading states
- Responsive design
- Security best practices

## Next Steps After Deployment

1. **Test the live app** - Go through complete user journey
2. **Add custom domain** - Set up DNS and SSL
3. **Connect backend** - Deploy FastAPI to Railway
4. **Set up monitoring** - Vercel Analytics, Sentry
5. **Configure OAuth apps** - Add production redirect URIs

## Support

- 📖 [Vercel Docs](https://vercel.com/docs)
- 🔧 [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- 💬 [Vercel Support](https://vercel.com/support)

## Current Status

✅ All code committed to GitHub
✅ All build errors fixed
✅ Dependencies installed
⏳ Waiting for manual Vercel dashboard deployment

**Next:** Follow steps above to deploy through Vercel dashboard with proper root directory configuration.
