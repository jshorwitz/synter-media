FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY *.js ./
COPY .env ./

# Create log directory
RUN mkdir -p /app/logs

# Install cron
RUN apk add --no-cache dcron

# Create cron job file
RUN echo "0 */4 * * * cd /app && node server-runner.js >> /app/logs/crosspost.log 2>&1" > /etc/crontabs/root

# Start cron and keep container running
CMD ["sh", "-c", "crond -f -d 8 & tail -f /dev/null"]

# Health check
HEALTHCHECK --interval=1h --timeout=10s \
  CMD test -f /app/logs/crosspost.log || exit 1
