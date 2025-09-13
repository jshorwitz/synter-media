#!/usr/bin/env node
/* eslint-disable */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '../../docs/ppc-screens');

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const base = process.env.SITE_URL || 'http://localhost:3000';
  const pages = [
    { slug: '/ppc', file: 'ppc-dashboard.png' },
    { slug: '/ppc/recommendations', file: 'ppc-recommendations.png' },
    { slug: '/ppc/audit', file: 'ppc-audit.png' },
  ];

  for (const p of pages) {
    const url = base + p.slug;
    console.log('Navigating to', url);
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(1000);
    const out = path.join(OUT_DIR, p.file);
    await page.screenshot({ path: out, fullPage: true });
    console.log('Saved', out);
  }

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
