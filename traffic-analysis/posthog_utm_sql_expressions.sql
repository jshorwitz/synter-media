-- PostHog SQL Expressions to Extract UTM Parameters from Referral URLs
-- These expressions can be used in PostHog's data management, insights, and breakdowns

-- Extract utm_source from referrer URL
extractURLParameter(properties.$referrer, 'utm_source')

-- Extract utm_medium from referrer URL
extractURLParameter(properties.$referrer, 'utm_medium')

-- Extract utm_campaign from referrer URL
extractURLParameter(properties.$referrer, 'utm_campaign')

-- Extract utm_term from referrer URL
extractURLParameter(properties.$referrer, 'utm_term')

-- Extract utm_content from referrer URL
extractURLParameter(properties.$referrer, 'utm_content')

-- Alternative: Extract utm_source from current URL (in case UTM params are in the landing page URL)
extractURLParameter(properties.$current_url, 'utm_source')

-- Combine referrer and current URL UTM source (prioritize current URL)
if(extractURLParameter(properties.$current_url, 'utm_source') != '', 
   extractURLParameter(properties.$current_url, 'utm_source'), 
   extractURLParameter(properties.$referrer, 'utm_source'))

-- Create a computed property for "Has UTM Data"
if(extractURLParameter(properties.$referrer, 'utm_source') != '' OR 
   extractURLParameter(properties.$current_url, 'utm_source') != '', 
   'Yes', 'No')

-- Extract all UTM parameters into a single string (for debugging)
concat(
  'utm_source=', extractURLParameter(properties.$referrer, 'utm_source'), ';',
  'utm_medium=', extractURLParameter(properties.$referrer, 'utm_medium'), ';',
  'utm_campaign=', extractURLParameter(properties.$referrer, 'utm_campaign'), ';',
  'utm_term=', extractURLParameter(properties.$referrer, 'utm_term'), ';',
  'utm_content=', extractURLParameter(properties.$referrer, 'utm_content')
)

-- For Reddit-specific tracking, create a boolean property
if(extractURLParameter(properties.$referrer, 'utm_source') = 'reddit' OR
   extractURLParameter(properties.$current_url, 'utm_source') = 'reddit',
   'Reddit Traffic', 'Other Traffic')

-- Full SQL query to analyze UTM data from pageviews
-- This can be used in PostHog SQL Insights
SELECT 
    extractURLParameter(properties.$referrer, 'utm_source') as utm_source,
    extractURLParameter(properties.$referrer, 'utm_medium') as utm_medium,
    extractURLParameter(properties.$referrer, 'utm_campaign') as utm_campaign,
    count() as event_count,
    countDistinct(distinct_id) as unique_users
FROM events 
WHERE event = '$pageview' 
  AND (extractURLParameter(properties.$referrer, 'utm_source') != '' 
       OR extractURLParameter(properties.$current_url, 'utm_source') != '')
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY utm_source, utm_medium, utm_campaign
ORDER BY event_count DESC

-- Query specifically for Reddit traffic
SELECT 
    properties.$current_url as landing_page,
    extractURLParameter(properties.$referrer, 'utm_campaign') as utm_campaign,
    count() as pageviews,
    countDistinct(distinct_id) as unique_visitors
FROM events 
WHERE event = '$pageview' 
  AND (extractURLParameter(properties.$referrer, 'utm_source') = 'reddit'
       OR extractURLParameter(properties.$current_url, 'utm_source') = 'reddit')
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY landing_page, utm_campaign
ORDER BY pageviews DESC
