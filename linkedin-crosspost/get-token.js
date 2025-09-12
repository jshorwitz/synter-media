require('dotenv').config();
const axios = require('axios');

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'https://localhost:3000/callback';
const AUTHORIZATION_CODE = 'AQSu-AKDqFE5I6gBqUNsDk7BUs2w26Dp-39sPd96LsrMrOS1PYJeZ7fFFvug6PU3138B5E9ip0X0H9WuTEbcT0-Y0cxJxegw6MbvkOxjk4sBMpP-iaJA0JQS-9MAXGfYG5pnoh_HzPZYSm0QLXgxapL3CI-QMpjuUnHkMU4BhqacWRhJFNxyiYHFrnrrMxWS6ntanEWBr-3QhdPK9yw';

async function getAccessToken() {
  try {
    const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: AUTHORIZATION_CODE,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret=REDACTED
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('\n✅ Success! Access Token Response:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log(`\n📝 Add this to your .env file:`);
    console.log(`LINKEDIN_ACCESS_TOKEN=${response.data.access_token}`);
    
  } catch (error) {
    console.error('❌ Error exchanging code for token:', error.response?.data || error.message);
  }
}

getAccessToken();
