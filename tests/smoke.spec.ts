// E2E smoke tests for the deployed site.
// Verifies: index loads, scroll reaches bottom, form rejects bad input, case page renders.

import { test, expect } from '@playwright/test';

test('index loads, scrolls, form errors on bad input', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1').first()).toContainText(/Software built/);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.fill('input[name="name"]', 'A');
  await page.fill('input[name="email"]', 'bad-email');
  await page.fill('textarea[name="project"]', 'short');
  await page.click('button[type="submit"]');
  await expect(page.locator('.form-status.err')).toBeVisible();
});

test('case study page loads', async ({ page }) => {
  await page.goto('/pages/case-one.html');
  await expect(page.locator('h1')).toBeVisible();
});
