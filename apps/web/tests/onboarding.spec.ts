import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('redirects to onboarding with URL from homepage', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find URL input - try multiple selectors
    const urlInput = page.locator('input[type="text"], input[type="url"], input[placeholder*="website"]').first();
    await urlInput.waitFor({ state: 'visible', timeout: 10000 });
    await urlInput.fill('shopify.com');
    
    // Find and click Get Started button
    const getStartedButton = page.locator('button:has-text("Get Started"), button:has-text("Analyze"), button:has-text("Start")').first();
    await getStartedButton.waitFor({ state: 'visible', timeout: 10000 });
    await getStartedButton.click();
    
    // Should redirect to onboarding with URL parameter
    await page.waitForURL(/\/onboarding\?url=.+/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/onboarding\?url=.*shopify\.com/);
    
    // Should see analysis step
    await expect(page.locator('text=/Analyzing/i')).toBeVisible({ timeout: 10000 });
  });

  test('shows Ad Footprint & Savings step after analysis', async ({ page }) => {
    // Go directly to onboarding with URL (use a known site with ads)
    await page.goto('/onboarding?url=shopify.com');
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    // Wait for analysis to complete (may need longer timeout)
    await expect(page.locator('text=/Business Type|Industry|Continue/i')).toBeVisible({ timeout: 45000 });
    
    // Click Continue to go to Ad Footprint step
    const continueBtn = page.locator('button:has-text("Continue")').first();
    await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
    await continueBtn.click();
    
    // Should show detecting ad footprint or already show results
    await expect(page.locator('text=/Detecting|Scanning|Detected Ad Platforms|save/i')).toBeVisible({ timeout: 10000 });
    
    // Wait for scan to complete - should show either scanning or results
    await expect(page.locator('text=/You could save|Detected Ad Platforms/i')).toBeVisible({ timeout: 50000 });
    
    // Should show ROI savings
    await expect(page.locator('text=/save/i')).toBeVisible();
    
    // Should show detected platforms grid
    await expect(page.locator('text=/Detected Ad Platforms/i')).toBeVisible();
    
    // Should have Continue button
    await expect(page.locator('button:has-text("Continue")').last()).toBeVisible();
  });

  test('completes full onboarding flow', async ({ page }) => {
    // Start onboarding with a real website
    await page.goto('/onboarding?url=shopify.com');
    await page.waitForLoadState('networkidle');
    
    // Wait for and complete analysis
    await expect(page.locator('text=/Business Type|Industry|Continue/i')).toBeVisible({ timeout: 45000 });
    
    let continueBtn = page.locator('button:has-text("Continue")').first();
    await continueBtn.waitFor({ state: 'visible' });
    await continueBtn.click();
    
    // Wait for ad footprint scan to complete
    await expect(page.locator('text=/You could save|Detected Ad Platforms/i')).toBeVisible({ timeout: 50000 });
    
    // Click continue to account creation
    continueBtn = page.locator('button').filter({ hasText: /Continue/i }).last();
    await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
    await continueBtn.click();
    
    // Fill account creation form with unique email
    const timestamp = Date.now();
    await page.waitForSelector('input[type="text"], input[placeholder*="Business"]', { timeout: 10000 });
    
    const businessNameInput = page.locator('input[type="text"]').first();
    await businessNameInput.fill('E2E Test Business');
    
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill(`e2e-test-${timestamp}@syntertest.com`);
    
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('TestPass123!@#');
    
    // Click create account
    const createBtn = page.locator('button').filter({ hasText: /Create Account/i });
    await createBtn.click();
    
    // Should proceed to business details or show success
    // Note: This might fail if account creation has issues, which is expected in testing
    await expect(page.locator('text=/Tell us about your business|Connect|business/i')).toBeVisible({ timeout: 15000 });
  });

  test('direct access to onboarding without URL shows step 2 (account creation)', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    // Should skip analysis and go straight to account creation
    await expect(page.locator('text=/Create your account|Email/i')).toBeVisible({ timeout: 10000 });
  });
});
