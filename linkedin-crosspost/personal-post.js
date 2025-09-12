require('dotenv').config();
const axios = require('axios');
const Parser = require('rss-parser');

async function postToPersonalLinkedIn() {
  const parser = new Parser();
  
  try {
    // Get latest article
    const feed = await parser.parseURL('https://ampcode.com/news.rss');
    const latest = feed.items[0];
    
    // Get full article content
    const fullContent = `📢 New from Amp by @Sourcegraph: ${latest.title}

Amp can now use 1 million tokens of context with Claude Sonnet 4, up from 432,000 tokens two weeks ago.

You should not use the full context window for most tasks in Amp. Instead, use small threads that are scoped to a single task. This yields better quality and faster results, and it's also more cost effective. A notice will appear when you hit 20% of the context window to remind you of this.

Longer threads are more expensive, both because each iteration of the agentic loop sends more and more tokens, and because requests with more than 200k tokens are roughly twice as expensive per token in Anthropic's API pricing.

Note: the screenshot shows 968k tokens because the context window is composed of 968k input tokens and 32k output tokens.

#Sourcegraph #AI #Developer #Programming #AmpCode #MachineLearning

Read the full article: ${latest.link}`;

    // Create LinkedIn share URL with full content
    const shareText = encodeURIComponent(fullContent);
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(latest.link)}&text=${shareText}`;
    
    console.log('Opening LinkedIn share dialog with full article content...');
    console.log('Share URL:', shareUrl);
    
    const { exec } = require('child_process');
    exec(`open '${shareUrl}'`);

    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

postToPersonalLinkedIn();
