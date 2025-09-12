require('dotenv').config();
const Parser = require('rss-parser');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class LinkedInCrossPoster {
  constructor() {
    this.parser = new Parser();
    this.rssUrl = process.env.RSS_FEED_URL || 'https://ampcode.com/news.rss';
    this.linkedinConfig = {
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
      organizationId: process.env.LINKEDIN_ORGANIZATION_ID
    };
    this.postIntervalHours = parseInt(process.env.POST_INTERVAL_HOURS) || 24;
    this.dryRun = false; // Set to live posting
    this.stateFile = path.join(__dirname, 'posted-articles.json');
  }

  async loadPostedArticles() {
    try {
      const data = await fs.readFile(this.stateFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log('No existing state file found, starting fresh');
      return {};
    }
  }

  async savePostedArticles(articles) {
    await fs.writeFile(this.stateFile, JSON.stringify(articles, null, 2));
  }

  async fetchRSSFeed() {
    try {
      console.log(`Fetching RSS feed from ${this.rssUrl}`);
      const feed = await this.parser.parseURL(this.rssUrl);
      console.log(`Found ${feed.items.length} articles in RSS feed`);
      return feed.items;
    } catch (error) {
      console.error('Error fetching RSS feed:', error.message);
      throw error;
    }
  }

  async postToLinkedIn(article) {
    const postData = {
      author: 'urn:li:member:~',
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: this.formatPostContent(article)
          },
          shareMediaCategory: 'ARTICLE',
          media: [
            {
              status: 'READY',
              originalUrl: article.link
            }
          ]
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    try {
      if (this.dryRun) {
        console.log('DRY RUN - Would post to LinkedIn:');
        console.log(JSON.stringify(postData, null, 2));
        return { success: true, dryRun: true };
      }

      const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postData, {
        headers: {
          'Authorization': `Bearer ${this.linkedinConfig.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      console.log(`Successfully posted article: ${article.title}`);
      return { success: true, response: response.data };
    } catch (error) {
      console.error('Error posting to LinkedIn:', error.response?.data || error.message);
      throw error;
    }
  }

  async getUserId() {
    try {
      const response = await axios.get('https://api.linkedin.com/v2/people/~', {
        headers: {
          'Authorization': `Bearer ${this.linkedinConfig.accessToken}`
        }
      });
      return response.data.id;
    } catch (error) {
      console.error('Error getting user ID:', error.message);
      throw error;
    }
  }

  formatPostContent(article) {
    const maxLength = 3000; // LinkedIn post character limit
    let content = `📢 New from Amp by @sourcegraph: ${article.title}\n\n`;
    
    if (article.contentSnippet) {
      const snippet = article.contentSnippet.substring(0, maxLength - content.length - 100);
      content += `${snippet}\n\n`;
    }
    
    content += `#Sourcegraph #AI #Developer #Programming\n\n`;
    content += `Read more: ${article.link}`;
    
    return content.substring(0, maxLength);
  }

  isRecentArticle(article) {
    if (!article.pubDate) return false;
    
    const articleDate = new Date(article.pubDate);
    const hoursAgo = this.postIntervalHours;
    const cutoffTime = new Date(Date.now() - (hoursAgo * 60 * 60 * 1000));
    
    return articleDate > cutoffTime;
  }

  async run() {
    try {
      console.log('Starting LinkedIn cross-poster...');
      
      if (!this.linkedinConfig.accessToken || !this.linkedinConfig.organizationId) {
        throw new Error('Missing LinkedIn credentials. Please check your .env file.');
      }

      const postedArticles = await this.loadPostedArticles();
      const articles = await this.fetchRSSFeed();
      
      const newArticles = articles.filter(article => 
        !postedArticles[article.link] && this.isRecentArticle(article)
      );

      console.log(`Found ${newArticles.length} new articles to post`);

      for (const article of newArticles) {
        try {
          console.log(`Processing: ${article.title}`);
          await this.postToLinkedIn(article);
          
          postedArticles[article.link] = {
            title: article.title,
            postedAt: new Date().toISOString()
          };
          
          await this.savePostedArticles(postedArticles);
          
          // Rate limiting - wait 1 second between posts
          if (newArticles.indexOf(article) < newArticles.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Failed to post article "${article.title}":`, error.message);
        }
      }

      console.log('Cross-posting completed');
    } catch (error) {
      console.error('Fatal error:', error.message);
      process.exit(1);
    }
  }
}

// Run the application
if (require.main === module) {
  const crossPoster = new LinkedInCrossPoster();
  crossPoster.run();
}

module.exports = LinkedInCrossPoster;
