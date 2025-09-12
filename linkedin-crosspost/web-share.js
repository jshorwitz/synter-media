const express = require('express');
const Parser = require('rss-parser');
require('dotenv').config();

const app = express();
const parser = new Parser();

app.get('/', async (req, res) => {
  try {
    const feed = await parser.parseURL('https://ampcode.com/news.rss');
    const latestArticle = feed.items[0];
    
    const postText = encodeURIComponent(
      `📢 New from Amp by @sourcegraph: ${latestArticle.title}\n\n${latestArticle.contentSnippet?.substring(0, 200)}...\n\n#Sourcegraph #AI #Developer #Programming`
    );
    
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(latestArticle.link)}&text=${postText}`;
    
    res.send(`
      <h2>Latest Amp Article</h2>
      <h3>${latestArticle.title}</h3>
      <p>${latestArticle.contentSnippet?.substring(0, 300)}...</p>
      <a href="${shareUrl}" target="_blank" style="background: #0077b5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Share on LinkedIn
      </a>
      <br><br>
      <a href="${latestArticle.link}" target="_blank">Read full article</a>
    `);
  } catch (error) {
    res.status(500).send('Error fetching RSS feed: ' + error.message);
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`LinkedIn sharing interface available at http://localhost:${port}`);
  console.log('Click the "Share on LinkedIn" button to post to your profile');
});
