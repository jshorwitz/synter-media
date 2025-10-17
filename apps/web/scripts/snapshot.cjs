#!/usr/bin/env node
/* eslint-disable */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '../../docs/ppc-screens');
const MARKETING_DIR = path.resolve(__dirname, '../public/screenshots');

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  if (!fs.existsSync(MARKETING_DIR)) fs.mkdirSync(MARKETING_DIR, { recursive: true });
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // Retina display
  });
  const page = await context.newPage();

  // Reduce motion for consistent screenshots
  await page.emulateMedia({ reducedMotion: 'reduce' });

  const base = process.env.SITE_URL || 'https://synter-clean-web.vercel.app';
  
  // Marketing screenshots for waitlist page
  const marketingPages = [
    { slug: '/demo', file: 'dashboard-overview.png', wait: 3000 },
    { slug: '/ppc', file: 'ppc-dashboard.png', wait: 2000 },
    { slug: '/ppc/recommendations', file: 'ppc-recommendations.png', wait: 2000 },
    { slug: '/settings/apps', file: 'integrations.png', wait: 2000 },
    { slug: '/onboarding', file: 'onboarding.png', wait: 2000 },
    { slug: '/waitlist', file: 'waitlist-hero.png', wait: 3000 },
  ];
  
  // Capture marketing screenshots
  console.log('Capturing marketing screenshots from', base);
  console.log('Using viewport: 1440x900 @ 2x scale\n');

  for (const p of marketingPages) {
    const url = base + p.slug;
    console.log('Navigating to', url);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(p.wait);
      const out = path.join(MARKETING_DIR, p.file);
      await page.screenshot({ path: out, fullPage: false });
      console.log('✓ Saved', out);
    } catch (error) {
      console.error('✗ Failed to capture', p.slug, ':', error.message);
    }
  }

  await browser.close();
  console.log('\n✅ All screenshots captured successfully!');
}

main().catch((e) => { console.error(e); process.exit(1); });
