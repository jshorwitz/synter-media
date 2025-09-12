require('dotenv').config();
const nodemailer = require('nodemailer');
const Parser = require('rss-parser');

async function sendLinkedInPostEmail() {
  const parser = new Parser();
  
  try {
    // Get latest article
    const feed = await parser.parseURL('https://ampcode.com/news.rss');
    const latest = feed.items[0];
    
    // Format post content
    const postContent = `📢 Exciting news from Amp by @sourcegraph: ${latest.title}

${latest.content || latest.contentSnippet}

#Sourcegraph #AI #Developer #Programming #AmpCode

Read more: ${latest.link}`;

    // Create LinkedIn share URL
    const shareText = encodeURIComponent(`📢 New from Amp by @sourcegraph: ${latest.title}\n\n${latest.contentSnippet?.substring(0, 200)}...\n\n#Sourcegraph #AI #Developer #Programming`);
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(latest.link)}&text=${shareText}`;

    // Email HTML content
    const emailContent = `
    <h2>LinkedIn Post Request - ${latest.title}</h2>
    
    <p>Hi Connor,</p>
    
    <p>Could you please post the following content to the Sourcegraph LinkedIn company page? This is about Amp's new feature.</p>
    
    <h3>LinkedIn Post Content:</h3>
    <div style="background: #f5f5f5; padding: 15px; border-left: 3px solid #0077b5; margin: 10px 0;">
    <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${postContent}</pre>
    </div>
    
    <p><strong>Quick Share Option:</strong><br>
    <a href="${shareUrl}" target="_blank" style="background: #0077b5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
    📤 Share on LinkedIn
    </a></p>
    
    <p><strong>Article Details:</strong></p>
    <ul>
    <li><strong>Title:</strong> ${latest.title}</li>
    <li><strong>URL:</strong> <a href="${latest.link}">${latest.link}</a></li>
    <li><strong>Published:</strong> ${latest.pubDate}</li>
    </ul>
    
    <p><strong>Instructions:</strong></p>
    <ul>
    <li>Post this to the Sourcegraph LinkedIn company page</li>
    <li>Feel free to adjust hashtags or formatting as needed for optimal engagement</li>
    <li>The share link above pre-fills the content for easy posting</li>
    </ul>
    
    <p>Thanks!<br>Joel</p>
    `;

    // Configure email transporter (using Gmail SMTP)
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: 'joel.horwitz@sourcegraph.com',
        pass: process.env.EMAIL_PASSWORD // App-specific password needed
      }
    });

    const mailOptions = {
      from: 'joel.horwitz@sourcegraph.com',
      to: 'connor.obrien@sourcegraph.com',
      cc: 'joel.horwitz@sourcegraph.com',
      subject: `LinkedIn Post Request - Amp ${latest.title}`,
      html: emailContent,
      text: postContent // Fallback text version
    };

    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n📝 To fix authentication:');
      console.log('1. Enable 2-factor auth on your Google account');
      console.log('2. Generate an App Password: https://support.google.com/accounts/answer/185833');
      console.log('3. Add EMAIL_PASSWORD=your_app_password to .env');
    }
  }
}

sendLinkedInPostEmail();
