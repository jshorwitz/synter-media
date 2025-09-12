# Reddit Conversions API (CAPI) Setup Guide

## Overview
This integration sends conversion events from PostHog to Reddit's Conversions API, enabling better ad attribution and optimization for Reddit campaigns.

## Prerequisites

### 1. Reddit Ads Account Setup
- Active Reddit Ads account
- Reddit Ads Pixel installed on your website
- Access to Reddit Ads Manager

### 2. Get Reddit CAPI Credentials

#### Step 1: Get Pixel ID
1. Log into [Reddit Ads Manager](https://ads.reddit.com)
2. Go to **Assets** > **Pixels**
3. Copy your **Pixel ID** (format: `t2_xxxxx`)

#### Step 2: Generate Conversion Access Token
1. In Reddit Ads Manager, go to **Assets** > **Pixels**
2. Click on your pixel
3. Go to **Conversions API** tab
4. Click **Generate Access Token**
5. Copy the generated token (this doesn't expire)

### 3. Configure Environment Variables

Create a `.env` file in your project directory:

```bash
# Reddit CAPI Configuration
REDDIT_PIXEL_ID=t2_your_pixel_id_here
REDDIT_CONVERSION_ACCESS_TOKEN=your_access_token_here

# PostHog Configuration (optional - defaults are set)
POSTHOG_API_KEY=REDACTED_POSTHOG_SECRET
POSTHOG_PROJECT_ID=176241
```

## Event Mapping

The integration automatically maps PostHog events to Reddit conversion events:

| PostHog Event | Reddit Conversion Event | Description |
|---------------|------------------------|-------------|
| `signup_completed` | `Lead` | User completed signup |
| `email_verified` | `CompleteRegistration` | User verified email |
| `subscription_started` | `Subscribe` | User started subscription |
| `purchase_completed` | `Purchase` | User completed purchase |
| `trial_started` | `FreeTrial` | User started free trial |
| `checkout_started` | `InitiateCheckout` | User started checkout |
| `product_viewed` | `ViewContent` | User viewed product |
| `add_to_cart` | `AddToCart` | User added to cart |

## Usage

### 1. Test Connection
```bash
node reddit_capi_integration.js test
```

This will:
- Verify your Reddit CAPI credentials
- Send a test conversion event
- Confirm the integration is working

### 2. Process Recent Conversions
```bash
# Process conversions from the last hour
node reddit_capi_integration.js process

# Process conversions from the last 24 hours
node reddit_capi_integration.js process 24
```

### 3. Start Continuous Monitoring
```bash
# Monitor every 5 minutes (default)
node reddit_capi_integration.js monitor

# Monitor every 10 minutes
node reddit_capi_integration.js monitor 10
```

## How It Works

### 1. Event Detection
- Queries PostHog for conversion events from Reddit traffic
- Filters events where `utm_source=reddit` or referrer contains Reddit
- Only processes events that match the configured event mapping

### 2. Data Transformation
- Converts PostHog event format to Reddit CAPI format
- Hashes PII data (emails, user IDs) for privacy
- Adds deduplication IDs to prevent duplicate conversions
- Maps event properties to Reddit's expected schema

### 3. Attribution Matching
The integration sends these user identifiers to Reddit for attribution:
- Hashed email addresses
- Hashed external user IDs (PostHog distinct_id)
- IP addresses
- User agents
- Screen dimensions
- Reddit UUID (if available from Reddit Pixel)

### 4. Conversion Events Sent
For each PostHog conversion event, Reddit receives:
- Event type and name
- Timestamp
- User data for attribution
- Event value/revenue (if available)
- Custom data including UTM parameters

## Verification

### 1. Check Reddit Ads Manager
1. Go to **Assets** > **Pixels** > **Conversions API**
2. View **Recent Activity** to see incoming events
3. Check **Event Summary** for conversion counts

### 2. Monitor Integration Logs
The integration provides detailed logging:
- ✅ Successful conversions sent
- ❌ Failed conversions with error details
- 📊 Processing summaries

### 3. Test with UTM Parameters
Create test URLs with Reddit UTM parameters:
```
https://ampcode.com/sign-up?utm_source=reddit&utm_medium=cpc&utm_campaign=test
```

Complete the conversion action and verify it appears in Reddit Ads Manager.

## Troubleshooting

### Common Issues

#### "Missing Reddit CAPI configuration"
- Verify `REDDIT_PIXEL_ID` and `REDDIT_CONVERSION_ACCESS_TOKEN` are set
- Check the `.env` file format

#### "No Reddit-attributed conversion events found"
- Ensure UTM parameters are properly set on Reddit traffic
- Verify PostHog is tracking the conversion events
- Check event name mapping in the script

#### "Reddit CAPI Error: 401 Unauthorized"
- Regenerate the conversion access token in Reddit Ads Manager
- Verify the token is correctly set in environment variables

#### "Reddit CAPI Error: 400 Bad Request"
- Check that the Pixel ID format is correct (should start with `t2_`)
- Verify required fields are being sent with events

### Debug Mode
Add detailed logging by modifying the script to log request/response data:

```javascript
console.log('Request:', JSON.stringify(conversionEvent, null, 2));
console.log('Response:', JSON.stringify(responseData, null, 2));
```

## Best Practices

### 1. Rate Limiting
- The integration includes 100ms delays between requests
- Monitor Reddit's rate limits in production
- Adjust intervals if you hit rate limits

### 2. Data Privacy
- All PII (emails, user IDs) are automatically hashed
- Only send necessary user data for attribution
- Comply with your privacy policy and regulations

### 3. Monitoring
- Run the integration continuously with monitoring
- Set up alerts for failed conversions
- Regular check Reddit Ads Manager for data accuracy

### 4. Testing
- Always test with the `test` command first
- Use small time windows when testing `process` command
- Verify events appear in Reddit Ads Manager before going live

## Production Deployment

### 1. Process Manager (PM2)
```bash
npm install -g pm2
pm2 start reddit_capi_integration.js --name reddit-capi -- monitor 5
pm2 save
pm2 startup
```

### 2. Systemd Service
Create `/etc/systemd/system/reddit-capi.service`:
```ini
[Unit]
Description=Reddit CAPI Integration
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/traffic-analysis
ExecStart=/usr/bin/node reddit_capi_integration.js monitor 5
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### 3. Docker Container
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY reddit_capi_integration.js .
CMD ["node", "reddit_capi_integration.js", "monitor", "5"]
```

## Next Steps

1. **Set up environment variables** with your Reddit CAPI credentials
2. **Test the connection** to verify everything works
3. **Process recent conversions** to backfill data
4. **Start continuous monitoring** for real-time sync
5. **Monitor Reddit Ads Manager** to verify conversions are being received
6. **Set up production deployment** for continuous operation

The integration will now automatically send Reddit-attributed conversions from PostHog to Reddit's Conversions API, improving your ad attribution and optimization capabilities.
