const express = require('express');
const Parser = require('rss-parser');

const app = express();
const parser = new Parser();

// Serve static files and favicon
app.use(express.static('public'));

// Cache for RSS data (refresh every 30 minutes)
let cachedFeed = null;
let lastFetch = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

async function getFeed() {
  const now = Date.now();
  if (cachedFeed && (now - lastFetch) < CACHE_DURATION) {
    return cachedFeed;
  }
  
  try {
    cachedFeed = await parser.parseURL('https://ampcode.com/news.rss');
    lastFetch = now;
    return cachedFeed;
  } catch (error) {
    console.error('Error fetching RSS:', error.message);
    return cachedFeed || { items: [] }; // Return cache or empty if first fetch fails
  }
}

function formatArticleForLinkedIn(article) {
  const maxLength = 2800; // Leave room for hashtags and link
  let content = `📢 New from Amp by @Sourcegraph: ${article.title}\n\n`;
  
  if (article.contentSnippet) {
    const snippet = article.contentSnippet.substring(0, maxLength - content.length - 100);
    content += `${snippet}...\n\n`;
  }
  
  content += `#Sourcegraph #AI #Developer #Programming #Synter\n\n`;
  content += `Read more: ${article.link}`;
  
  return content;
}

function createShareUrl(article) {
  const shareText = encodeURIComponent(formatArticleForLinkedIn(article));
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(article.link)}&text=${shareText}`;
}

app.get('/', async (req, res) => {
  try {
    const feed = await getFeed();
    const recentArticles = feed.items.slice(0, 10); // Show latest 10 articles
    
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Amp News → LinkedIn Share Tool</title>
        <link rel="icon" href="https://ampcode.com/amp-mark-color.svg" />
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
                background: #0a0a0a; 
                color: #e5e5e5; 
                line-height: 1.6; 
                min-height: 100vh;
            }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { 
                text-align: center; 
                margin-bottom: 40px; 
                padding: 40px 20px;
            }
            .amp-logo { 
                width: 60px; 
                height: auto; 
                margin-bottom: 20px; 
            }
            .title { 
                font-size: 2.5rem; 
                margin-bottom: 10px; 
                color: #F34E3F;
                font-weight: 300;
            }
            .subtitle { 
                font-size: 1.1rem; 
                color: #a1a1aa; 
                font-weight: 300;
            }
            .article { 
                border: 1px solid #2a2a2a; 
                border-radius: 8px; 
                padding: 24px; 
                margin: 20px 0; 
                background: #111111;
            }
            .article h3 { 
                margin-top: 0; 
                color: #F34E3F; 
                font-size: 1.4rem;
                font-weight: 500;
                margin-bottom: 12px;
            }
            .article-meta { 
                color: #71717a; 
                font-size: 0.9em; 
                margin: 12px 0; 
            }
            .article-meta a { color: #F34E3F; text-decoration: none; }
            .article-meta a:hover { text-decoration: underline; }
            .share-btn { 
                background: #F34E3F; 
                color: white; 
                padding: 12px 24px; 
                text-decoration: none; 
                border-radius: 6px; 
                display: inline-block; 
                margin: 15px 0; 
                font-weight: 500;
                transition: all 0.2s;
            }
            .share-btn:hover { 
                background: #d63e2f; 
                transform: translateY(-1px);
            }
            .preview { 
                background: #1a1a1a; 
                padding: 18px; 
                border-left: 3px solid #F34E3F; 
                margin: 15px 0; 
                font-size: 0.9em; 
                border-radius: 0 6px 6px 0;
            }
            .footer { 
                text-align: center; 
                margin-top: 60px; 
                padding-top: 40px;
                border-top: 1px solid #2a2a2a;
                color: #71717a; 
                font-size: 0.9em; 
            }
            .footer a { color: #F34E3F; text-decoration: none; }
            .footer a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <svg class="amp-logo" width="71" height="20" viewBox="0 0 71 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.41508 17.2983L7.88484 12.7653L9.51146 18.9412L11.8745 18.2949L9.52018 9.32758L0.69527 6.93747L0.066864 9.35199L6.13926 11.0015L1.68806 15.5279L3.41508 17.2983Z" fill="#F34E3F"></path>
                    <path d="M16.3044 12.0436L18.6675 11.3973L16.3132 2.43003L7.48824 0.0399246L6.85984 2.45444L14.312 4.47881L16.3044 12.0436Z" fill="#F34E3F"></path>
                    <path d="M12.9126 15.4902L15.2756 14.8439L12.9213 5.87659L4.09639 3.48648L3.46799 5.901L10.9201 7.92537L12.9126 15.4902Z" fill="#F34E3F"></path>
                    <path d="M30.0743 5.19107H30.1139L25.4343 16.4945H22.5195L28.4087 2.39039H31.7994L37.6886 16.4945H34.7539L30.0743 5.19107ZM33.8616 13.9759H26.3266L27.0405 11.5581H33.1478L33.8616 13.9759Z" fill="currentColor"></path>
                    <path d="M39.4621 16.4945V5.43283H42.139V16.4945H39.4621ZM46.8582 10.3088C46.8582 9.39553 46.6996 8.73063 46.3823 8.3141C46.0651 7.8979 45.5957 7.68951 44.9745 7.68951C44.3927 7.68951 43.8641 7.86076 43.3882 8.20331C42.9123 8.54582 42.5386 9.00262 42.2679 9.57339C41.9968 10.1445 41.8614 10.7319 41.8614 11.3364L41.3062 8.75739C41.4515 8.09939 41.7058 7.49809 42.0696 6.95405C42.433 6.41005 42.9188 5.98377 43.527 5.67463C44.1349 5.36578 44.8422 5.21119 45.6487 5.21119C46.9177 5.21119 47.8859 5.61764 48.5536 6.43021C49.221 7.24307 49.555 8.36795 49.555 9.80511V16.4945H46.8582V10.3088ZM54.3139 10.3088C54.3139 9.44935 54.1385 8.79767 53.7884 8.35441C53.438 7.91115 52.9522 7.68951 52.331 7.68951C51.7361 7.68951 51.2073 7.86076 50.7447 8.20331C50.2818 8.54582 49.9283 8.99254 49.6838 9.54319C49.4391 10.0941 49.317 10.6851 49.317 11.3162L48.2661 8.61633C48.4644 7.97159 48.7881 7.39074 49.2377 6.87347C49.687 6.35653 50.2357 5.95012 50.8835 5.65449C51.531 5.35919 52.2582 5.21119 53.0647 5.21119C53.9105 5.21119 54.6277 5.396 55.2161 5.76531C55.8042 6.13491 56.2438 6.66193 56.5347 7.34696C56.8253 8.03202 56.971 8.85153 56.971 9.80512V16.4945H54.3139L54.3139 10.3088Z" fill="currentColor"></path>
                    <path d="M59.1945 19.9601V5.43284H61.8714V6.72237C62.3339 6.22559 62.8891 5.84937 63.537 5.59406C64.1845 5.33904 64.8853 5.2112 65.6388 5.2112C66.6036 5.2112 67.4928 5.45994 68.3058 5.95672C69.1188 6.45381 69.7598 7.14234 70.2292 8.02194C70.6983 8.90189 70.9331 9.89925 70.9331 11.0141C70.9331 12.1289 70.6983 13.1231 70.2292 13.9961C69.7598 14.8694 69.1219 15.5443 68.3157 16.021C67.5092 16.4976 66.6036 16.7363 65.5992 16.7363C65.11 16.7363 64.6406 16.679 64.1913 16.565C63.7418 16.451 63.3188 16.2829 62.9223 16.0613C62.5257 15.8397 62.1753 15.561 61.8713 15.2251V19.9601H59.1945ZM65.1233 14.2781C65.7312 14.2781 66.2734 14.1405 66.7493 13.8651C67.2252 13.5899 67.5951 13.2036 67.8597 12.7065C68.124 12.2097 68.2563 11.6456 68.2563 11.014C68.2563 10.329 68.124 9.73459 67.8597 9.23087C67.5951 8.72715 67.2252 8.33771 66.7493 8.06224C66.2734 7.7871 65.7312 7.64918 65.1233 7.64918C64.4755 7.64918 63.9069 7.78364 63.418 8.05217C62.9288 8.32103 62.5487 8.70699 62.2779 9.21072C62.0068 9.71444 61.8714 10.2956 61.8714 10.9536C61.8714 11.6386 62.0068 12.233 62.2779 12.7368C62.5486 13.2405 62.9288 13.6233 63.418 13.8852C63.9069 14.1472 64.4755 14.2781 65.1233 14.2781Z" fill="currentColor"></path>
                </svg>
                <h1 class="title">News → LinkedIn</h1>
                <p class="subtitle">Share the latest Amp updates to your LinkedIn profile</p>
            </div>
        
        ${recentArticles.map(article => `
            <div class="article">
                <h3>${article.title}</h3>
                <div class="article-meta">
                    📅 ${new Date(article.pubDate).toLocaleDateString()} | 
                    📖 <a href="${article.link}" target="_blank">Read Full Article</a>
                </div>
                
                <div class="preview">
                    <strong>LinkedIn Post Preview:</strong><br>
                    ${formatArticleForLinkedIn(article).replace(/\n/g, '<br>')}
                </div>
                
                <a href="${createShareUrl(article)}" target="_blank" class="share-btn">
                    📤 Share to LinkedIn
                </a>
            </div>
        `).join('')}
        
            <div class="footer">
                <p>🔄 Feed updates every 30 minutes | Built by <a href="https://sourcegraph.com" target="_blank">Sourcegraph</a></p>
                <p>📡 RSS: <a href="https://ampcode.com/news.rss" target="_blank">ampcode.com/news.rss</a> | 
                   🏠 <a href="https://synter.ai" target="_blank">synter.ai</a></p>
            </div>
        </div>
        
        <script>
            window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
        </script>
        <script defer src="/_vercel/insights/script.js"></script>
    </body>
    </html>
    `;
    
    res.send(html);
  } catch (error) {
    res.status(500).send(`
      <h1>Error</h1>
      <p>Unable to fetch Amp news feed: ${error.message}</p>
      <p><a href="/">Try again</a></p>
    `);
  }
});

// API endpoint for latest article share URL
app.get('/api/latest', async (req, res) => {
  try {
    const feed = await getFeed();
    const latest = feed.items[0];
    
    res.json({
      title: latest.title,
      url: latest.link,
      pubDate: latest.pubDate,
      shareUrl: createShareUrl(latest),
      content: formatArticleForLinkedIn(latest)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 LinkedIn share tool available at:`);
  console.log(`   Local: http://localhost:${PORT}`);
  console.log(`   Network: http://0.0.0.0:${PORT}`);
  console.log(`\n📖 Share this URL with your team to let them easily share Amp news on LinkedIn!`);
});
