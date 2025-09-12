#!/usr/bin/env node

// PostHog UTM-Filterable Signup Funnel Creator
// Creates a signup funnel insight that can be filtered by UTM parameters

class PostHogFunnelCreator {
  constructor(apiKey, projectId) {
    this.apiKey = apiKey || 'REDACTED_POSTHOG_SECRET';
    this.projectId = projectId || '176241';
    this.baseUrl = 'https://app.posthog.com';
  }

  // Create UTM-filterable signup funnel insight
  async createUTMSignupFunnel() {
    const funnelConfig = {
      name: "Signup Flow by UTM Source",
      description: "Complete signup funnel with UTM parameter filtering",
      filters: {
        insight: "FUNNELS",
        funnel_viz_type: "steps",
        interval: "day",
        date_from: "-30d",
        date_to: null,
        breakdown: ["utm_source"],
        breakdown_type: "event",
        funnel_window_interval: 30,
        funnel_window_interval_unit: "day",
        events: [
          {
            id: "$pageview",
            name: "$pageview",
            type: "events",
            order: 0,
            properties: [
              {
                key: "$current_url",
                operator: "icontains",
                value: ["ampcode.com"],
                type: "event"
              }
            ]
          },
          {
            id: "signup_started", 
            name: "signup_started",
            type: "events",
            order: 1,
            properties: []
          },
          {
            id: "password_created",
            name: "password_created", 
            type: "events",
            order: 2,
            properties: []
          },
          {
            id: "email_verified",
            name: "email_verified",
            type: "events", 
            order: 3,
            properties: []
          },
          {
            id: "signup_completed",
            name: "signup_completed",
            type: "events",
            order: 4,
            properties: []
          }
        ],
        properties: [
          {
            key: "utm_source",
            operator: "is_set",
            value: null,
            type: "event"
          }
        ]
      }
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/projects/${this.projectId}/insights/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(funnelConfig)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PostHog API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Successfully created UTM signup funnel insight!');
      console.log(`🔗 View at: ${this.baseUrl}/project/${this.projectId}/insights/${data.id}`);
      
      return data;
    } catch (error) {
      console.error('❌ Error creating funnel:', error);
      throw error;
    }
  }

  // Create UTM parameter property insights
  async createUTMPropertyInsights() {
    const insights = [];

    // UTM Source breakdown
    const utmSourceConfig = {
      name: "Traffic by UTM Source (Last 30 days)",
      description: "Pageviews broken down by UTM source parameter",
      filters: {
        insight: "TRENDS", 
        interval: "day",
        date_from: "-30d",
        date_to: null,
        display: "ActionsTable",
        breakdown: ["utm_source"],
        breakdown_type: "event",
        events: [
          {
            id: "$pageview",
            name: "$pageview",
            type: "events",
            order: 0,
            properties: [
              {
                key: "$current_url",
                operator: "icontains", 
                value: ["ampcode.com"],
                type: "event"
              }
            ]
          }
        ]
      }
    };

    // UTM Campaign breakdown  
    const utmCampaignConfig = {
      name: "Traffic by UTM Campaign (Last 30 days)",
      description: "Pageviews broken down by UTM campaign parameter",
      filters: {
        insight: "TRENDS",
        interval: "day", 
        date_from: "-30d",
        date_to: null,
        display: "ActionsTable",
        breakdown: ["utm_campaign"],
        breakdown_type: "event",
        events: [
          {
            id: "$pageview",
            name: "$pageview",
            type: "events",
            order: 0,
            properties: [
              {
                key: "$current_url",
                operator: "icontains",
                value: ["ampcode.com"],
                type: "event"
              }
            ]
          }
        ]
      }
    };

    // UTM Medium breakdown
    const utmMediumConfig = {
      name: "Traffic by UTM Medium (Last 30 days)",
      description: "Pageviews broken down by UTM medium parameter", 
      filters: {
        insight: "TRENDS",
        interval: "day",
        date_from: "-30d", 
        date_to: null,
        display: "ActionsTable",
        breakdown: ["utm_medium"],
        breakdown_type: "event",
        events: [
          {
            id: "$pageview",
            name: "$pageview",
            type: "events",
            order: 0,
            properties: [
              {
                key: "$current_url", 
                operator: "icontains",
                value: ["ampcode.com"],
                type: "event"
              }
            ]
          }
        ]
      }
    };

    const configs = [utmSourceConfig, utmCampaignConfig, utmMediumConfig];
    
    for (const config of configs) {
      try {
        console.log(`📊 Creating insight: ${config.name}`);
        
        const response = await fetch(`${this.baseUrl}/api/projects/${this.projectId}/insights/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(config)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Failed to create ${config.name}: ${response.status} - ${errorText}`);
          continue;
        }

        const data = await response.json();
        insights.push({
          name: config.name,
          id: data.id,
          url: `${this.baseUrl}/project/${this.projectId}/insights/${data.id}`
        });
        
        console.log(`✅ Created: ${config.name}`);
        console.log(`🔗 View at: ${this.baseUrl}/project/${this.projectId}/insights/${data.id}`);
        
      } catch (error) {
        console.error(`❌ Error creating ${config.name}:`, error);
      }
    }

    return insights;
  }

  // Create dashboard with all UTM insights
  async createUTMDashboard(funnelInsightId, utmInsights) {
    const dashboardConfig = {
      name: "UTM-Filtered Signup Analytics",
      description: "Complete signup flow analysis with UTM parameter filtering",
      tiles: [
        {
          insight: funnelInsightId,
          layouts: {},
          color: "blue"
        },
        ...utmInsights.map(insight => ({
          insight: insight.id,
          layouts: {},
          color: "green"
        }))
      ]
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/projects/${this.projectId}/dashboards/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dashboardConfig)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Dashboard creation failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('🎛️ Successfully created UTM dashboard!');
      console.log(`🔗 View at: ${this.baseUrl}/project/${this.projectId}/dashboards/${data.id}`);
      
      return data;
    } catch (error) {
      console.error('❌ Error creating dashboard:', error);
      throw error;
    }
  }

  // Main setup function
  async setupUTMAnalytics() {
    console.log('🚀 Setting up UTM-filterable signup analytics...');
    
    try {
      // Create the main UTM signup funnel
      console.log('\n📈 Creating UTM signup funnel...');
      const funnelInsight = await this.createUTMSignupFunnel();
      
      // Create UTM property breakdown insights
      console.log('\n📊 Creating UTM property insights...');
      const utmInsights = await this.createUTMPropertyInsights();
      
      // Create combined dashboard
      console.log('\n🎛️ Creating UTM analytics dashboard...');
      const dashboard = await this.createUTMDashboard(funnelInsight.id, utmInsights);
      
      console.log('\n🎉 Setup Complete!');
      console.log('\n📋 Created Resources:');
      console.log(`📈 UTM Signup Funnel: ${this.baseUrl}/project/${this.projectId}/insights/${funnelInsight.id}`);
      utmInsights.forEach(insight => {
        console.log(`📊 ${insight.name}: ${insight.url}`);
      });
      console.log(`🎛️ UTM Dashboard: ${this.baseUrl}/project/${this.projectId}/dashboards/${dashboard.id}`);
      
      return {
        funnel: funnelInsight,
        insights: utmInsights,
        dashboard: dashboard
      };
      
    } catch (error) {
      console.error('❌ Setup failed:', error);
      throw error;
    }
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const creator = new PostHogFunnelCreator();
  
  const command = process.argv[2] || 'help';
  
  switch (command) {
    case 'funnel':
      await creator.createUTMSignupFunnel();
      break;
      
    case 'insights':
      await creator.createUTMPropertyInsights();
      break;
      
    case 'setup':
      await creator.setupUTMAnalytics();
      break;
      
    default:
      console.log(`
📊 PostHog UTM Signup Funnel Creator

Usage:
  node posthog_utm_signup_funnel.js funnel     # Create UTM signup funnel only
  node posthog_utm_signup_funnel.js insights  # Create UTM property insights only  
  node posthog_utm_signup_funnel.js setup     # Create everything (recommended)

Examples:
  node posthog_utm_signup_funnel.js setup     # Creates complete UTM analytics setup
      `);
  }
}

export default PostHogFunnelCreator;
