# Remote Server Deployment

## Local Cron Setup (macOS)

Run this to set up automatic checking every 4 hours:

```bash
chmod +x cron-setup.sh
./cron-setup.sh
```

This will:
- Add a cron job to run every 4 hours
- Create a log file to track runs
- Send email notifications when new articles are found

## Docker Deployment

1. **Build the image:**
   ```bash
   docker build -t linkedin-crosspost .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name linkedin-crosspost \
     --restart unless-stopped \
     -v $(pwd)/logs:/app/logs \
     linkedin-crosspost
   ```

3. **View logs:**
   ```bash
   docker logs -f linkedin-crosspost
   # Or view the log file:
   tail -f logs/crosspost.log
   ```

## Cloud Deployment Options

### 1. Digital Ocean App Platform
```bash
# Create app.yaml
doctl apps create --spec app.yaml
```

### 2. Railway
```bash
railway login
railway link
railway up
```

### 3. Heroku
```bash
heroku create linkedin-crosspost-app
git push heroku main
heroku addons:create scheduler:standard
# Add scheduled job: node server-runner.js
```

### 4. AWS Lambda (Scheduled)
Use AWS EventBridge to trigger the function every 4 hours.

## Environment Variables for Production

Required in `.env`:
```bash
# Email settings
EMAIL_PASSWORD=your_gmail_app_password
NOTIFICATION_EMAIL=joel.horwitz@sourcegraph.com

# RSS settings  
RSS_FEED_URL=https://ampcode.com/news.rss
POST_INTERVAL_HOURS=72

# Optional
NODE_ENV=production
```

## How It Works

1. **Scheduled Check:** Runs every 4 hours via cron
2. **New Articles:** Compares RSS feed with stored state
3. **Email Notification:** Sends email with pre-filled LinkedIn share link
4. **One-Click Sharing:** Click email link to post to LinkedIn
5. **State Tracking:** Prevents duplicate notifications

The server version sends email notifications instead of opening browsers, making it perfect for headless deployment.
