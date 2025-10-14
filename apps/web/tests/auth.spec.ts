import { test, expect } from '@playwright/test';

test.describe('Authentication [P0]', () => {
  const timestamp = Date.now();
  const testEmail = `e2e-auth-${timestamp}@syntertest.com`;
  const testPassword = 'SecureTestPass123!';

  test('signup with email and password', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to signup
    const signupBtn = page.locator('button:has-text("Sign Up"), a:has-text("Sign Up")').first();
    await signupBtn.click();

    // Fill signup form
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    const businessNameInput = page.locator('input[type="text"], input[placeholder*="name"], input[placeholder*="business"]').first();
    await businessNameInput.fill('E2E Test Business');

    // Submit
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign Up"), button:has-text("Create")').first();
    await submitBtn.click();

    // Expect redirect to dashboard or onboarding
    await page.waitForURL(/\/(dashboard|onboarding|campaigns)/, { timeout: 15000 });
    
    // Verify logged in
    await expect(page.locator('text=/dashboard|campaigns|settings/i')).toBeVisible({ timeout: 10000 });
  });

  test('login with existing credentials', async ({ page }) => {
    // First create account
    await page.goto('/api/auth/signup');
    await page.request.post('/api/auth/signup', {
      data: {
        email: testEmail,
        password: testPassword,
        name: 'E2E Test User',
      },
    });

    // Now login
    await page.goto('/');
    const loginBtn = page.locator('button:has-text("Log In"), a:has-text("Log In"), button:has-text("Sign In")').first();
    await loginBtn.click();

    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    const submitBtn = page.locator('button[type="submit"], button:has-text("Log In"), button:has-text("Sign In")').first();
    await submitBtn.click();

    // Verify logged in
    await page.waitForURL(/\/(dashboard|campaigns)/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/(dashboard|campaigns)/);
  });

  test('logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/api/auth/login');
    await page.request.post('/api/auth/login', {
      data: { email: testEmail, password: testPassword },
    });

    await page.goto('/dashboard');
    
    // Click logout
    const logoutBtn = page.locator('button:has-text("Log Out"), button:has-text("Sign Out"), a:has-text("Logout")').first();
    await logoutBtn.click();

    // Should redirect to homepage
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');
  });

  test('[P1] reject weak password', async ({ page }) => {
    await page.goto('/');
    const signupBtn = page.locator('button:has-text("Sign Up")').first();
    await signupBtn.click();

    await page.fill('input[type="email"]', `weak-${timestamp}@test.com`);
    await page.fill('input[type="password"]', '123'); // Too weak

    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Expect error message
    await expect(page.locator('text=/password.*strong|password.*least|invalid/i')).toBeVisible({ timeout: 5000 });
  });

  test('[P1] reject duplicate email signup', async ({ page }) => {
    // Create account first
    await page.request.post('/api/auth/signup', {
      data: {
        email: `duplicate-${timestamp}@test.com`,
        password: testPassword,
        name: 'First User',
      },
    });

    // Try to signup again
    await page.goto('/');
    const signupBtn = page.locator('button:has-text("Sign Up")').first();
    await signupBtn.click();

    await page.fill('input[type="email"]', `duplicate-${timestamp}@test.com`);
    await page.fill('input[type="password"]', testPassword);

    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Expect error
    await expect(page.locator('text=/already exists|email.*taken/i')).toBeVisible({ timeout: 5000 });
  });
});
