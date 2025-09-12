// Check existing PostHog data for UTM parameters in URLs

const sampleEvents = [
  {
    current_url: "https://ampcode.com/settings",
    referrer: "https://ampcode.com/settings"
  },
  {
    current_url: "https://ampcode.com/settings?checkout=success",
    referrer: "https://ampcode.com/settings?checkout=success"
  },
  {
    current_url: "https://ampcode.com/settings?configure=true&client=VS+Code",
    referrer: "https://ampcode.com/settings?configure=true&client=VS%20Code"
  },
  {
    current_url: "https://ampcode.com/",
    referrer: "https://ampcode.com/"
  },
  {
    current_url: "https://ampcode.com/how-i-use-amp?hist=x%3C/k&attribute_pa_marime=x%3C/k&pgj=x%3C/k",
    referrer: null
  }
];

function extractUTMFromUrl(url) {
  if (!url) return {};
  
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    const utmParams = {};
    
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    
    utmKeys.forEach(key => {
      const value = params.get(key);
      if (value) {
        utmParams[key] = value;
      }
    });
    
    return utmParams;
  } catch (e) {
    return {};
  }
}

console.log('Checking sample URLs for UTM parameters:');
console.log('=================================================');

sampleEvents.forEach((event, index) => {
  const currentUrlUTM = extractUTMFromUrl(event.current_url);
  const referrerUTM = extractUTMFromUrl(event.referrer);
  
  const hasUTM = Object.keys(currentUrlUTM).length > 0 || Object.keys(referrerUTM).length > 0;
  
  console.log(`Event ${index + 1}:`);
  console.log(`  Current URL: ${event.current_url}`);
  console.log(`  Referrer: ${event.referrer}`);
  console.log(`  UTM in current URL: ${JSON.stringify(currentUrlUTM)}`);
  console.log(`  UTM in referrer: ${JSON.stringify(referrerUTM)}`);
  console.log(`  Has UTM data: ${hasUTM ? 'YES' : 'NO'}`);
  console.log('');
});

// Simulate what would happen if we had Reddit UTM data
console.log('Example of what Reddit UTM data would look like:');
console.log('=================================================');
const redditUrl = "https://ampcode.com/?utm_source=reddit&utm_medium=social&utm_campaign=launch_announcement";
const redditUTM = extractUTMFromUrl(redditUrl);
console.log(`URL: ${redditUrl}`);
console.log(`Extracted UTM: ${JSON.stringify(redditUTM)}`);
