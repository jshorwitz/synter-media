import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

export function makeXOAuth() {
  const consumerKey = process.env.X_ADS_CONSUMER_KEY;
  const consumerSecret = process.env.X_ADS_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error('X Ads OAuth credentials not configured');
  }

  return new OAuth({
    consumer: { 
      key: consumerKey, 
      secret: consumerSecret 
    },
    signature_method: 'HMAC-SHA1',
    hash_function(baseString, key) {
      return crypto.createHmac('sha1', key).update(baseString).digest('base64');
    },
  });
}

export function parseOAuthResponse(body: string): Record<string, string> {
  const params = new URLSearchParams(body);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}
