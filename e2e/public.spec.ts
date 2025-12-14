import { test, expect } from '@playwright/test';

/**
 * Smoke tests - verify pages load without crashing
 */
test.describe('Smoke tests', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FFCAM/);
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/a-propos');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/politique-confidentialite');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('Auth protection', () => {
  test('notifications redirects to sign-in', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page).toHaveURL(/sign-in/, { timeout: 10000 });
  });
});
