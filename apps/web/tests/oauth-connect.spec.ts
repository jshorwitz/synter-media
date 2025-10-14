import { test, expect } from '@playwright/test';

test.describe('OAuth Platform Connections [P0]', () => {
  const timestamp = Date.now();
  const testEmail = `e2e-oauth-${timestamp}@syntertest.com`;
  const testPassword = 'TestPass123!';

  // Setup: Create and login user before each test
  test.beforeEach(async ({ page }) => {
    // Create account
    await page.request.post('/api/auth/signup', {
      data: {
        email: testEmail,
        password: testPassword,
        name: 'OAuth Test User',
      },
    });

    // Login
    await page.goto('/');
    // Assume we have login functionality, navigate appropriately
    await page.goto('/dashboard');
  });

  const providers = ['google', 'linkedin', 'reddit', 'x', 'microsoft'];

  for (const provider of providers) {
    test(`connect ${provider} via OAuth`, async ({ page, context }) => {
      // Navigate to connections page
      await page.goto('/settings/connections');
      await page.waitForLoadState('networkidle');

      // Get OAuth state for testing
      const stateResponse = await page.request.get(`/api/test/oauth/state?provider=${provider}`);
      const { state } = await stateResponse.json();

      // Mock OAuth token and userinfo endpoints
      await context.route('**/api/__mocks__/oauth/token', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: `mock_token_${provider}_${Date.now()}`,
            refresh_token: `mock_refresh_${provider}`,
            token_type: 'Bearer',
            expires_in: 3600,
          }),
        });
      });

      await context.route(`**/api/__mocks__/oauth/userinfo*`, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: `${provider}_test_user`,
            email: testEmail,
            name: 'E2E Test User',
          }),
        });
      });

      // Navigate to callback endpoint directly (simulating OAuth redirect)
      await page.goto(`/api/connect/${provider}/callback?code=E2E_TEST_CODE&state=${state}`);

      // Should redirect back to settings with success
      await page.waitForURL(/settings.*connected|success/i, { timeout: 10000 });

      // Verify connection appears in UI
      await page.goto('/settings/connections');
      await expect(page.locator(`text=/Connected.*${provider}|${provider}.*Connected/i`)).toBeVisible({ timeout: 10000 });
    });
  }

  test('[P1] handle OAuth denial (access_denied)', async ({ page }) => {
    await page.goto('/settings/connections');
    
    const stateResponse = await page.request.get('/api/test/oauth/state?provider=google');
    const { state } = await stateResponse.json();

    // Navigate to callback with error
    await page.goto(`/api/connect/google/callback?error=access_denied&state=${state}`);

    // Should show error and not create connection
    await expect(page.locator('text=/denied|cancelled|error/i')).toBeVisible({ timeout: 10000 });
  });

  test('[P1] reject invalid OAuth state', async ({ page }) => {
    await page.goto('/api/connect/google/callback?code=TEST&state=invalid_state_token');

    // Should show error
    await expect(page.locator('text=/invalid.*state|error/i')).toBeVisible({ timeout: 10000 });
  });

  test('[P1] disconnect provider', async ({ page, context }) => {
    // First connect
    await page.goto('/settings/connections');
    
    const stateResponse = await page.request.get('/api/test/oauth/state?provider=google');
    const { state } = await stateResponse.json();

    await context.route('**/api/__mocks__/oauth/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: 'token', id: 'user' }),
      });
    });

    await page.goto(`/api/connect/google/callback?code=E2E_CODE&state=${state}`);
    await page.goto('/settings/connections');

    // Now disconnect
    const disconnectBtn = page.locator('button:has-text("Disconnect")').first();
    await disconnectBtn.click();

    // Confirm if there's a modal
    const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    // Verify disconnected
    await expect(page.locator('text=/Connect.*Google|Not.*Connected/i')).toBeVisible({ timeout: 5000 });
  });
});
