# Staging Workflow

## Branches

- `main` → Production (syntermedia.ai)
- `develop` → Staging (auto-deployed by Vercel)

## Workflow

### 1. Make changes on develop branch
```bash
git checkout develop
# make your changes
git add .
git commit -m "Add new feature"
git push origin develop
```

### 2. Vercel auto-deploys to staging URL
- Vercel automatically deploys `develop` branch
- Preview URL: `synter-clean-web-git-develop.vercel.app`
- Test your changes on this URL

### 3. Merge to production when ready
```bash
git checkout main
git merge develop
git push origin main
```

## Vercel Configuration

In Vercel Project Settings → Git:
- **Production Branch**: `main` → syntermedia.ai
- **Preview Branches**: All others (including `develop`)

## Environment Variables

Staging and Production can use different env vars:
- Go to Vercel → Settings → Environment Variables
- Use dropdown to set per environment:
  - Production only
  - Preview only
  - Development only

Tip: Use different LOOPS_TEMPLATE_ID for staging to avoid sending test emails from production templates.
