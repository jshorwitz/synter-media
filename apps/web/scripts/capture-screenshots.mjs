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

  const screenshots = [
    {
      name: 'ppc-dashboard',
      url: `${baseUrl}/ppc`,
      selector: 'text=PPC Manager',
      description: 'PPC Dashboard'
    },
    {
      name: 'ppc-recommendations',
      url: `${baseUrl}/ppc/recommendations`,
      selector: 'text=Total Recommendations',
      description: 'AI Recommendations'
    }
  ];

  for (const shot of screenshots) {
    console.log(`📸 Capturing ${shot.description} screenshot...`);
    
    try {
      await page.goto(shot.url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait for content to load
      await page.waitForSelector(shot.selector, { timeout: 10000 });
      await page.waitForTimeout(2000); // Extra time for animations

      // Take screenshot
      const screenshotPath = path.join(
        __dirname,
        `../public/screenshots/${shot.name}.png`
      );
      
      await page.screenshot({
        path: screenshotPath,
        fullPage: false,
      });

      console.log(`✅ ${shot.description} saved to: ${screenshotPath}`);
    } catch (error) {
      console.error(`❌ Error capturing ${shot.description}:`, error);
    }
  }

  await browser.close();
}

captureScreenshots().catch(console.error);
