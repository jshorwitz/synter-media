# LinkedIn Cross-Poster for Amp News

Automatically cross-posts articles from Amp's RSS feed to the Sourcegraph LinkedIn company page.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure LinkedIn API:**
   - Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
   - Create a new app or use existing one
   - Enable "Share on LinkedIn" product
   - Request `w_member_social` permission
   - Get your Client ID, Client Secret, and Organization ID

3. **Set up environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your LinkedIn credentials:
   - `LINKEDIN_CLIENT_ID`: Your app's client ID
   - `LINKEDIN_CLIENT_SECRET`: Your app's client secret  
   - `LINKEDIN_ACCESS_TOKEN`: OAuth access token (see Authentication below)
   - `LINKEDIN_ORGANIZATION_ID`: Sourcegraph's LinkedIn organization ID

## Authentication

To get an access token:

1. **Authorization URL:**
   ```
   https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=w_member_social
   ```

2. **Exchange code for token:**
   ```bash
   curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
     -H 'Content-Type: application/x-www-form-urlencoded' \
     -d 'grant_type=authorization_code&code=AUTHORIZATION_CODE&redirect_uri=YOUR_REDIRECT_URI&client_id=YOUR_CLIENT_ID&client_secret=REDACTED'
   ```

## Usage

**Test mode (dry run):**
```bash
npm start
```

**Live posting:**
Set `DRY_RUN=false` in `.env`, then:
```bash
npm start
```

## Configuration

- `POST_INTERVAL_HOURS`: Only post articles newer than this many hours (default: 24)
- `DRY_RUN`: If true, shows what would be posted without actually posting (default: true)

## Features

- ✅ Fetches latest articles from Amp RSS feed
- ✅ Filters for recent articles only
- ✅ Avoids duplicate posts by tracking posted articles
- ✅ Formats content for LinkedIn with proper length limits
- ✅ Rate limiting between posts
- ✅ Comprehensive error handling
- ✅ Dry run mode for testing

## Scheduling

To run automatically, set up a cron job:
```bash
# Run every 4 hours
0 */4 * * * cd /path/to/linkedin-crosspost && npm start
```

## Files

- `index.js`: Main application logic
- `package.json`: Dependencies and scripts
- `.env`: Configuration (create from .env.example)
- `posted-articles.json`: Tracks already posted articles (auto-generated)
