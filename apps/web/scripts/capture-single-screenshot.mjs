import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function captureScreenshot() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Hide scrollbars
  await page.addStyleTag({
    content: `
      ::-webkit-scrollbar { display: none; }
      * { scrollbar-width: none; }
    `
  });

  const baseUrl = process.env.BASE_URL || 'https://syntermedia.ai';
  const targetPage = process.argv[2] || '/optimizations/recommendations';
  const outputName = process.argv[3] || 'ppc-recommendations';

  console.log(`📸 Capturing screenshot of ${targetPage}...`);
  console.log(`🌐 URL: ${baseUrl}${targetPage}`);
  
  try {
    // Navigate to page
    await page.goto(`${baseUrl}${targetPage}`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for content to load
    await page.waitForTimeout(3000); // Extra time for charts to render

    // Take screenshot
    const screenshotPath = path.join(
      __dirname,
      `../public/screenshots/${outputName}.png`
    );
    
    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
    });

    console.log(`✅ Screenshot saved to: ${screenshotPath}`);
  } catch (error) {
    console.error(`❌ Error capturing screenshot:`, error);
  } finally {
    await browser.close();
  }
}

captureScreenshot().catch(console.error);
