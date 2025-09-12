require('dotenv').config();
const readline = require('readline');

/**
 * Helper script to generate LinkedIn OAuth URLs and exchange authorization codes for access tokens
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'https://localhost:3000/callback';

function generateAuthUrl() {
  const scope = 'w_member_social';
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${scope}`;
  
  console.log('LinkedIn OAuth Authorization URL:');
  console.log(authUrl);
  console.log('\n1. Visit this URL in your browser');
  console.log('2. Log in with the LinkedIn account that has admin access to Sourcegraph company page');
  console.log('3. Grant permissions');
  console.log('4. Copy the authorization code from the redirect URL');
}

async function exchangeCodeForToken() {
  return new Promise((resolve, reject) => {
    rl.question('Enter the authorization code: ', async (code) => {
      try {
        const axios = require('axios');
        
        const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', 
          new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            client_secret=REDACTED
          }), {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        console.log('\nAccess Token Response:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log(`\nAdd this to your .env file:`);
        console.log(`LINKEDIN_ACCESS_TOKEN=${response.data.access_token}`);
        
        rl.close();
        resolve(response.data);
      } catch (error) {
        console.error('Error exchanging code for token:', error.response?.data || error.message);
        rl.close();
        reject(error);
      }
    });
  });
}

async function main() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in your .env file');
    process.exit(1);
  }

  generateAuthUrl();
  await exchangeCodeForToken();
}

if (require.main === module) {
  main();
}
