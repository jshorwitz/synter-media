import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Hide scrollbars
  await page.addStyleTag({
    content: `
      ::-webkit-scrollbar { display: none; }
      body { overflow: hidden !important; }
    `
  });

  const baseUrl = process.env.BASE_URL || 'https://syntermedia.ai';

  console.log('📸 Capturing PPC Recommendations screenshot...');
  
  try {
    // Navigate to recommendations page
    await page.goto(`${baseUrl}/ppc/recommendations`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for content to load
    await page.waitForSelector('text=Total Recommendations', { timeout: 10000 });
    await page.waitForTimeout(2000); // Extra time for animations

    // Take screenshot
    const screenshotPath = path.join(
      __dirname,
      '../public/screenshots/ppc-recommendations.png'
    );
    
    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
    });

    console.log('✅ Screenshot saved to:', screenshotPath);
  } catch (error) {
    console.error('❌ Error capturing screenshot:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

captureScreenshots().catch(console.error);
