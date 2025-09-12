require('dotenv').config();
const nodemailer = require('nodemailer');
const Parser = require('rss-parser');
const fs = require('fs').promises;
const path = require('path');

class ServerLinkedInCrossPoster {
  constructor() {
    this.parser = new Parser();
    this.rssUrl = process.env.RSS_FEED_URL || 'https://ampcode.com/news.rss';
    this.postIntervalHours = parseInt(process.env.POST_INTERVAL_HOURS) || 72;
    this.stateFile = path.join(__dirname, 'posted-articles.json');
    this.notificationEmail = process.env.NOTIFICATION_EMAIL || 'joel.horwitz@sourcegraph.com';
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

  formatFullContent(article) {
    return `📢 New from Amp by @Sourcegraph: ${article.title}

Amp can now use 1 million tokens of context with Claude Sonnet 4, up from 432,000 tokens two weeks ago.

You should not use the full context window for most tasks in Amp. Instead, use small threads that are scoped to a single task. This yields better quality and faster results, and it's also more cost effective. A notice will appear when you hit 20% of the context window to remind you of this.

Longer threads are more expensive, both because each iteration of the agentic loop sends more and more tokens, and because requests with more than 200k tokens are roughly twice as expensive per token in Anthropic's API pricing.

Note: the screenshot shows 968k tokens because the context window is composed of 968k input tokens and 32k output tokens.

#Sourcegraph #AI #Developer #Programming #AmpCode #MachineLearning

Read the full article: ${article.link}`;
  }

  createShareUrl(article) {
    const shareText = encodeURIComponent(this.formatFullContent(article));
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(article.link)}&text=${shareText}`;
  }

  async sendNotificationEmail(article) {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: 'joel.horwitz@sourcegraph.com',
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const shareUrl = this.createShareUrl(article);
    const emailContent = `
    <h2>🔔 New Amp Article Ready for LinkedIn</h2>
    
    <p><strong>Title:</strong> ${article.title}</p>
    <p><strong>Published:</strong> ${article.pubDate}</p>
    <p><strong>URL:</strong> <a href="${article.link}">${article.link}</a></p>
    
    <h3>Quick Actions:</h3>
    <p>
    <a href="${shareUrl}" target="_blank" style="background: #0077b5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
    📤 Share to LinkedIn (Pre-filled)
    </a>
    </p>
    
    <h3>LinkedIn Post Content:</h3>
    <div style="background: #f5f5f5; padding: 15px; border-left: 3px solid #0077b5; margin: 10px 0;">
    <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${this.formatFullContent(article)}</pre>
    </div>
    
    <p><em>This email was generated automatically by the LinkedIn cross-poster running on the server.</em></p>
    `;

    const mailOptions = {
      from: 'joel.horwitz@sourcegraph.com',
      to: this.notificationEmail,
      subject: `📢 New Amp Article: ${article.title}`,
      html: emailContent,
      text: `New Amp Article: ${article.title}\n\nShare URL: ${shareUrl}\n\n${this.formatFullContent(article)}`
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Notification email sent for: ${article.title}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending email:', error.message);
      return false;
    }
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
      console.log('🚀 Starting LinkedIn cross-poster server...');
      console.log(`📅 Checking for articles from last ${this.postIntervalHours} hours`);
      
      const postedArticles = await this.loadPostedArticles();
      const articles = await this.fetchRSSFeed();
      
      const newArticles = articles.filter(article => 
        !postedArticles[article.link] && this.isRecentArticle(article)
      );

      console.log(`🔍 Found ${newArticles.length} new articles to process`);

      for (const article of newArticles) {
        console.log(`📝 Processing: ${article.title}`);
        
        const emailSent = await this.sendNotificationEmail(article);
        
        if (emailSent) {
          postedArticles[article.link] = {
            title: article.title,
            processedAt: new Date().toISOString(),
            notificationSent: true
          };
          
          await this.savePostedArticles(postedArticles);
          console.log(`✅ Processed: ${article.title}`);
        }
        
        // Rate limiting
        if (newArticles.indexOf(article) < newArticles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (newArticles.length === 0) {
        console.log('📭 No new articles found');
      } else {
        console.log(`📧 Sent ${newArticles.length} notification email(s)`);
      }
      
      console.log('✅ Cross-posting check completed');
    } catch (error) {
      console.error('💥 Fatal error:', error.message);
      process.exit(1);
    }
  }
}

// Run the application
if (require.main === module) {
  const crossPoster = new ServerLinkedInCrossPoster();
  crossPoster.run();
}

module.exports = ServerLinkedInCrossPoster;
