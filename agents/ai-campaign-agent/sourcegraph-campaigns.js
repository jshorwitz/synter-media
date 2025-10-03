// Sourcegraph Google Ads Campaign Configuration for AI Agent
// Based on existing campaign analysis and optimization data

export const SOURCEGRAPH_CAMPAIGNS = {
  // Primary Amp product campaigns
  amp_promotion: {
    name: "25Q1 - Amp Promotion - North America",
    type: "AMP_BRAND",
    product: "AMP",
    target_audience: "enterprise_developers",
    daily_budget: 250, // $250/day
    landing_page: "https://sourcegraph.com/amp",
    keywords: [
      "ai coding assistant",
      "amp coding tool", 
      "automated code completion",
      "ai pair programming",
      "enterprise code assistant"
    ],
    negative_keywords: [
      "free", "cheap", "student", "tutorial", "learn to code",
      "homework", "school", "education", "course"
    ],
    ad_copy_themes: [
      "1M token context window for massive projects",
      "Enterprise-grade AI coding assistance", 
      "Understand entire codebase context",
      "Advanced beyond simple autocomplete"
    ],
    utm_campaign: "amp_promotion_na",
    target_cac: 120, // $120 per conversion
    min_roas: 300 // 3:1 return on ad spend
  },

  // Code search enterprise campaigns  
  code_search_enterprise: {
    name: "25Q1 - Enterprise Code Search - Global",
    type: "CODE_SEARCH_ENTERPRISE", 
    product: "CODE_SEARCH",
    target_audience: "enterprise_engineering_teams",
    daily_budget: 180, // $180/day
    landing_page: "https://sourcegraph.com/enterprise",
    keywords: [
      "enterprise code search",
      "code search platform",
      "large codebase search",
      "monorepo search tool",
      "code intelligence platform"
    ],
    negative_keywords: [
      "open source", "free", "individual", "personal", "small team"
    ],
    ad_copy_themes: [
      "Search massive codebases instantly",
      "Enterprise code intelligence platform",
      "Scale code discovery across teams",
      "Universal code search for any language"
    ],
    utm_campaign: "enterprise_code_search",
    target_cac: 200, // $200 per conversion
    min_roas: 250 // 2.5:1 return on ad spend
  },

  // Competitor campaigns
  competitor_targeting: {
    name: "25Q1 - GitHub Copilot Alternative - Global",
    type: "COMPETITOR",
    product: "AMP", 
    target_audience: "github_copilot_users",
    daily_budget: 150, // $150/day
    landing_page: "https://sourcegraph.com/amp?utm_content=copilot_alternative",
    keywords: [
      "github copilot alternative",
      "cursor ai alternative", 
      "codeium alternative",
      "ai coding tool comparison",
      "better than github copilot"
    ],
    negative_keywords: [
      "github copilot price", "github copilot free", "how to use github copilot"
    ],
    ad_copy_themes: [
      "More context than GitHub Copilot",
      "1M token window vs. Copilot's limited context",
      "Enterprise security and compliance",
      "Superior codebase understanding"
    ],
    utm_campaign: "copilot_alternative",
    target_cac: 150, // $150 per conversion
    min_roas: 270 // 2.7:1 return on ad spend
  },

  // Performance Max campaigns
  pmax_amp: {
    name: "25Q1 - Amp PMax - Global",
    type: "PERFORMANCE_MAX",
    product: "AMP",
    target_audience: "broad_enterprise_developers", 
    daily_budget: 300, // $300/day
    landing_page: "https://sourcegraph.com/amp",
    asset_groups: [
      {
        name: "Enterprise AI Coding",
        headlines: [
          "AI Coding Assistant for Enterprise",
          "1M Token Context Window",
          "Advanced Code Completion",
          "Amp by Sourcegraph"
        ],
        descriptions: [
          "Handle massive projects with Amp's 1M token context window. Understand code relationships across thousands of files.",
          "Enterprise-grade AI coding assistant with advanced context understanding and intelligent code suggestions."
        ],
        images: ["amp_enterprise_hero.jpg", "amp_context_demo.jpg"],
        videos: ["amp_demo_60s.mp4"]
      }
    ],
    utm_campaign: "pmax_amp",
    target_cac: 100, // $100 per conversion
    min_roas: 350 // 3.5:1 return on ad spend
  }
};

export const CAMPAIGN_OPTIMIZATION_RULES = {
  // Budget adjustment rules
  budget_rules: {
    increase_threshold: {
      min_conversions: 5, // Need at least 5 conversions
      max_cac: 80, // CAC below $80
      min_roas: 400 // ROAS above 4:1
    },
    decrease_threshold: {
      max_cac: 200, // CAC above $200
      max_roas: 150, // ROAS below 1.5:1
      min_spend: 100 // At least $100 spend for evaluation
    },
    pause_threshold: {
      max_cac: 300, // CAC above $300
      min_spend: 200, // At least $200 spend
      zero_conversions_days: 7 // No conversions for 7 days
    }
  },

  // Keyword optimization rules
  keyword_rules: {
    negative_keyword_triggers: [
      "cost_per_conversion > 250",
      "conversion_rate < 0.5",
      "quality_score < 3"
    ],
    bid_increase_triggers: [
      "impression_share < 60",
      "cost_per_conversion < 100", 
      "quality_score >= 7"
    ],
    bid_decrease_triggers: [
      "cost_per_conversion > 150",
      "quality_score < 5"
    ]
  },

  // AI prompt engineering
  ai_optimization_focus: [
    "Maximize conversions for Sourcegraph Amp AI coding assistant",
    "Target enterprise developers and engineering teams",
    "Compete effectively against GitHub Copilot and Cursor",
    "Emphasize 1M token context window as key differentiator",
    "Focus on enterprise security and compliance benefits",
    "Optimize for B2B software development use cases"
  ]
};

export const SOURCEGRAPH_TARGETING = {
  // Geographic targeting
  locations: {
    primary: ["United States", "Canada", "United Kingdom", "Germany"],
    secondary: ["Australia", "Netherlands", "France", "Sweden", "Switzerland"]
  },

  // Audience targeting
  audiences: {
    enterprise_developers: [
      "Software Engineers", "Tech Leads", "Engineering Managers",
      "DevOps Engineers", "Platform Engineers", "Principal Engineers"
    ],
    company_sizes: ["1000+ employees", "500-1000 employees"],
    industries: ["Technology", "Financial Services", "Healthcare", "E-commerce"]
  },

  // Device and platform targeting
  devices: {
    desktop: 70, // 70% budget allocation
    mobile: 20,  // 20% budget allocation  
    tablet: 10   // 10% budget allocation
  },

  // Time-based targeting
  scheduling: {
    business_hours: {
      monday_friday: "08:00-18:00",
      timezone: "America/Los_Angeles"
    },
    peak_performance_hours: ["09:00-11:00", "14:00-16:00"]
  }
};

// Export campaign data for the AI agent
export function getSourcegraphCampaignConfig() {
  return {
    campaigns: SOURCEGRAPH_CAMPAIGNS,
    rules: CAMPAIGN_OPTIMIZATION_RULES,
    targeting: SOURCEGRAPH_TARGETING,
    metadata: {
      last_updated: new Date().toISOString(),
      version: "1.0.0",
      total_campaigns: Object.keys(SOURCEGRAPH_CAMPAIGNS).length,
      total_daily_budget: Object.values(SOURCEGRAPH_CAMPAIGNS)
        .reduce((sum, campaign) => sum + campaign.daily_budget, 0)
    }
  };
}
