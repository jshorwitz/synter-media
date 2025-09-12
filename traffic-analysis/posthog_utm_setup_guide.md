# PostHog UTM Parameter Extraction Setup Guide

## Method 1: Using Data Pipeline Transformation (Recommended)

### Step 1: Navigate to Data Pipelines
1. Go to PostHog dashboard: https://app.posthog.com
2. Navigate to **Data pipelines** in the left sidebar
3. Click on the **Transformations** tab

### Step 2: Create URL Parameters Transformation
1. Click **+ New transformation**
2. Search for "URL parameters to event properties"
3. Click on it to add it

### Step 3: Configure the Transformation
Configure with these settings:
- **URL query parameters to convert**: `utm_source,utm_medium,utm_campaign,utm_term,utm_content`
- **Prefix**: Leave blank (or use `utm_` if you want)
- **Suffix**: Leave blank
- **Ignore the case of URL parameters**: `Yes` (recommended)
- **Add to user properties**: `No` (unless you want UTM data on user profiles)
- **Add to user initial properties**: `Yes` (to track first UTM source)
- **Always JSON stringify**: `No`

### Step 4: Enable and Test
1. Click **Create**
2. Make sure the transformation is **Enabled**
3. It will now automatically extract UTM parameters from all future events

## Method 2: Using SQL Expressions in Insights

### For Analysis and Breakdowns
Use these SQL expressions in your PostHog insights:

#### UTM Source Breakdown:
```sql
extractURLParameter(properties.$current_url, 'utm_source')
```

#### UTM Medium Breakdown:
```sql
extractURLParameter(properties.$current_url, 'utm_medium')
```

#### UTM Campaign Breakdown:
```sql
extractURLParameter(properties.$current_url, 'utm_campaign')
```

#### Combined UTM Source (from current URL or referrer):
```sql
if(extractURLParameter(properties.$current_url, 'utm_source') != '', 
   extractURLParameter(properties.$current_url, 'utm_source'), 
   extractURLParameter(properties.$referrer, 'utm_source'))
```

#### Reddit Traffic Filter:
```sql
extractURLParameter(properties.$current_url, 'utm_source') = 'reddit' OR
extractURLParameter(properties.$referrer, 'utm_source') = 'reddit'
```

## Method 3: SQL Insights for Reddit Signup Analysis

### Create a SQL Insight
1. Go to **Insights** > **New insight** > **SQL**
2. Use this query to find Reddit signups:

```sql
SELECT 
    extractURLParameter(properties.$current_url, 'utm_source') as utm_source,
    extractURLParameter(properties.$current_url, 'utm_medium') as utm_medium,
    extractURLParameter(properties.$current_url, 'utm_campaign') as utm_campaign,
    count() as events,
    countDistinct(distinct_id) as unique_users
FROM events 
WHERE event = '$pageview'
  AND (extractURLParameter(properties.$current_url, 'utm_source') = 'reddit'
       OR extractURLParameter(properties.$referrer, 'utm_source') = 'reddit')
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY utm_source, utm_medium, utm_campaign
ORDER BY events DESC
```

### For Future Signup Tracking
Once you implement signup events, use this query:
```sql
SELECT 
    extractURLParameter(properties.$current_url, 'utm_source') as utm_source,
    count() as signups
FROM events 
WHERE event = 'signup_completed'
  AND extractURLParameter(properties.$current_url, 'utm_source') = 'reddit'
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY utm_source
```

## Verification

### Test the Setup
1. Create a test URL with UTM parameters:
   `https://ampcode.com/?utm_source=reddit&utm_medium=social&utm_campaign=test`

2. Visit this URL and check if the UTM parameters are captured:
   - Go to **Activity** in PostHog
   - Look for your pageview event
   - Check if UTM properties are now present

### Expected Results
After setup, you should see new properties on your events:
- `utm_source`
- `utm_medium` 
- `utm_campaign`
- `utm_term`
- `utm_content`

These will be automatically extracted from any URL that contains UTM parameters.

## Next Steps
1. Set up signup event tracking to capture conversions
2. Create funnels from UTM pageviews to signups
3. Build dashboards to monitor UTM performance
4. Set up alerts for Reddit traffic spikes
