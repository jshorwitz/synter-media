require('dotenv').config();
const Parser = require('rss-parser');
const fs = require('fs').promises;
const path = require('path');

class PostGenerator {
  constructor() {
    this.parser = new Parser();
    this.rssUrl = process.env.RSS_FEED_URL || 'https://ampcode.com/news.rss';
    this.postIntervalHours = parseInt(process.env.POST_INTERVAL_HOURS) || 72;
    this.stateFile = path.join(__dirname, 'posted-articles.json');
  }

  async loadPostedArticles() {
    try {
      const data = await fs.readFile(this.stateFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }

  async savePostedArticles(articles) {
    await fs.writeFile(this.stateFile, JSON.stringify(articles, null, 2));
  }

  async fetchRSSFeed() {
    const feed = await this.parser.parseURL(this.rssUrl);
    return feed.items;
  }

  formatPostContent(article) {
    const maxLength = 3000;
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
    console.log('Generating LinkedIn posts for manual posting...');
    
    const postedArticles = await this.loadPostedArticles();
    const articles = await this.fetchRSSFeed();
    
    const newArticles = articles.filter(article => 
      !postedArticles[article.link] && this.isRecentArticle(article)
    );

    console.log(`Found ${newArticles.length} new articles to post:\n`);

    for (const article of newArticles) {
      console.log('='.repeat(80));
      console.log(`TITLE: ${article.title}`);
      console.log(`DATE: ${article.pubDate}`);
      console.log(`URL: ${article.link}`);
      console.log('='.repeat(80));
      console.log('LINKEDIN POST CONTENT:');
      console.log(this.formatPostContent(article));
      console.log('='.repeat(80));
      console.log();
      
      // Mark as posted so we don't generate again
      postedArticles[article.link] = {
        title: article.title,
        generatedAt: new Date().toISOString()
      };
    }

    await this.savePostedArticles(postedArticles);
    
    if (newArticles.length > 0) {
      console.log('Copy the content above and paste it to your LinkedIn profile:');
      console.log('https://www.linkedin.com/in/joelshorwitz');
    } else {
      console.log('No new articles to post.');
    }
  }
}

const generator = new PostGenerator();
generator.run();
