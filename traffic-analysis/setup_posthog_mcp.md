# PostHog MCP Setup Instructions

## Step 1: Get Your Personal API Key

1. Go to PostHog: https://app.posthog.com/settings/user-api-keys
2. Click "Create personal API key"
3. Use the `mcp_server` preset 
4. Copy the generated API key (starts with `phx_`)

## Step 2: Configure MCP Client

Add this configuration to your MCP client settings:

```json
{
  "mcpServers": {
    "posthog": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote@latest",
        "https://mcp.posthog.com/mcp?features=workspace,insights,dashboards,flags,experiments",
        "--header",
        "Authorization:${POSTHOG_AUTH_HEADER}"
      ],
      "env": {
        "POSTHOG_AUTH_HEADER": "Bearer YOUR_API_KEY_HERE"
      }
    }
  }
}
```

## Step 3: Test the Connection

Once configured, you should be able to:
- Query PostHog data using natural language
- Create dashboards and insights
- Manage feature flags
- Analyze experiments
- Search documentation

## Available Features

The MCP server includes these features:
- `workspace`: Organization and project management
- `insights`: Analytics insights and SQL queries  
- `dashboards`: Dashboard creation and management
- `flags`: Feature flag management
- `experiments`: A/B testing experiments
- `error-tracking`: Error monitoring
- `llm-analytics`: LLM usage tracking
- `docs`: PostHog documentation search

## Usage Examples

After setup, you can ask:
- "Show me signup conversion rates for the last 30 days"
- "Create a dashboard for our signup funnel"
- "What are the top referrer sources?"
- "Show me recent signup_page_visit events"
