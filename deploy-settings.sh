#!/bin/bash
# Deploy settings panel to Railway as standalone service

echo "🚀 Deploying Settings Panel to Railway..."

# Create temporary directory for deployment
TEMP_DIR=$(mktemp -d)
SETTINGS_DIR="packages/settings"

# Copy settings files to temp directory
echo "📁 Copying settings files..."
cp -r "$SETTINGS_DIR"/* "$TEMP_DIR/"

# Copy root dependencies that settings needs
cp package.json "$TEMP_DIR/"
cp pnpm-lock.yaml "$TEMP_DIR/" 2>/dev/null || echo "No pnpm-lock.yaml found"

# Create production Dockerfile for settings
cat > "$TEMP_DIR/Dockerfile" << 'EOF'
# Settings Panel Production Dockerfile
FROM node:18-alpine

# Install pnpm
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
RUN pnpm build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start command
CMD ["pnpm", "start"]
EOF

# Create production package.json
cat > "$TEMP_DIR/package.json" << 'EOF'
{
  "name": "synter-settings",
  "version": "1.0.0",
  "description": "Synter Settings Panel",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "db:generate": "prisma generate",
    "db:push": "prisma db push"
  },
  "dependencies": {
    "next": "^14.2.18",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@prisma/client": "^5.22.0",
    "prisma": "^5.22.0",
    "stripe": "^17.5.0",
    "zod": "^3.23.8",
    "clsx": "^2.1.1",
    "lucide-react": "^0.469.0",
    "jsonwebtoken": "^9.0.2",
    "argon2": "^0.41.1",
    "nanoid": "^5.0.9",
    "nodemailer": "^6.9.18"
  },
  "devDependencies": {
    "@types/node": "^22.10.6",
    "@types/react": "^18.3.17",
    "@types/react-dom": "^18.3.1",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/nodemailer": "^6.4.18",
    "typescript": "^5.6.3",
    "tailwindcss": "^3.4.16",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.24"
  }
}
EOF

# Create railway.toml for settings
cat > "$TEMP_DIR/railway.toml" << 'EOF'
[build]
builder = "dockerfile"

[deploy]
startCommand = "pnpm start"
healthcheckPath = "/"
healthcheckTimeout = 300
restartPolicyType = "always"
EOF

cd "$TEMP_DIR"

echo "📦 Contents of deployment directory:"
ls -la

echo "🚀 Deploying to Railway..."
railway up

echo "🔗 Getting domain..."
railway domain

echo "✅ Deployment complete!"
echo "🧹 Cleaning up temp directory..."
rm -rf "$TEMP_DIR"
