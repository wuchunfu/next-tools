import { test, expect } from '@playwright/test';

test.describe('Tool - Display Tester', () => {
  test.beforeEach(async ({ page }) => {
    // Set language to English for consistent testing
    await page.addInitScript(() => {
      localStorage.setItem('locale', 'en');
    });
    await page.goto('/display-tester');
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Display Tester/i);
  });

  test('displays all test mode cards', async ({ page }) => {
    await expect(page.getByTestId('test-mode-solid')).toBeVisible();
    await expect(page.getByTestId('test-mode-grayscale')).toBeVisible();
    await expect(page.getByTestId('test-mode-gradient')).toBeVisible();
    await expect(page.getByTestId('test-mode-grid')).toBeVisible();
    await expect(page.getByTestId('test-mode-response')).toBeVisible();
  });

  test('displays tips section', async ({ page }) => {
    await expect(page.getByTestId('testing-tips')).toBeVisible();
  });

  test('can click solid colors test mode', async ({ page }) => {
    const solidColorsCard = page.getByTestId('test-mode-solid');
    await expect(solidColorsCard).toBeVisible();
    await solidColorsCard.click();
    
    // Wait for potential fullscreen transition
    await page.waitForTimeout(500);
  });

  test('can click grayscale test mode', async ({ page }) => {
    const grayscaleCard = page.getByTestId('test-mode-grayscale');
    await expect(grayscaleCard).toBeVisible();
    await grayscaleCard.click();
    await page.waitForTimeout(500);
  });

  test('can click gradient test mode', async ({ page }) => {
    const gradientCard = page.getByTestId('test-mode-gradient');
    await expect(gradientCard).toBeVisible();
    await gradientCard.click();
    await page.waitForTimeout(500);
  });

  test('can click grid test mode', async ({ page }) => {
    const gridCard = page.getByTestId('test-mode-grid');
    await expect(gridCard).toBeVisible();
    await gridCard.click();
    await page.waitForTimeout(500);
  });

  test('can click response time test mode', async ({ page }) => {
    const responseCard = page.getByTestId('test-mode-response');
    await expect(responseCard).toBeVisible();
    await responseCard.click();
    await page.waitForTimeout(500);
  });

  test('all test mode cards have start test buttons', async ({ page }) => {
    await expect(page.getByTestId('start-test-solid')).toBeVisible();
    await expect(page.getByTestId('start-test-grayscale')).toBeVisible();
    await expect(page.getByTestId('start-test-gradient')).toBeVisible();
    await expect(page.getByTestId('start-test-grid')).toBeVisible();
    await expect(page.getByTestId('start-test-response')).toBeVisible();
  });

  test('page layout is responsive', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByTestId('test-mode-solid')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByTestId('test-mode-solid')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByTestId('test-mode-solid')).toBeVisible();
  });
});
