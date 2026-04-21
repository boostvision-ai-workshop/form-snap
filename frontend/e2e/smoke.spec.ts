import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/./);
  await page.waitForLoadState('networkidle');
  const body = page.locator('body');
  await expect(body).toBeVisible();
});

test('page renders hero heading', async ({ page }) => {
  await page.goto('/');
  const heading = page.getByRole('heading', {
    name: /Build Your SaaS Product with AI/,
  });
  await expect(heading).toBeVisible();
});

test('page renders get started button', async ({ page }) => {
  await page.goto('/');
  const getStartedButton = page.getByRole('link', { name: /Get Started/ }).first();
  await expect(getStartedButton).toBeVisible();
});
