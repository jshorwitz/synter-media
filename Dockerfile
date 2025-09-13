# Use Node.js 18
FROM node:18-alpine

# Install pnpm
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/api/package.json ./packages/api/
COPY packages/workers/package.json ./packages/workers/
COPY packages/settings/package.json ./packages/settings/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Generate Prisma client for settings
RUN cd packages/settings && npx prisma generate

# Expose port (Railway will set this automatically)
EXPOSE 8088

# Start the application
CMD ["pnpm", "start"]
