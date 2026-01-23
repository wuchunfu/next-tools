import { expect, test } from '@playwright/test';

test.describe('Tool - Data Transfer Calculator', () => {
  test.beforeEach(async ({ page }) => {
    // Set language to English for consistent testing
    await page.addInitScript(() => {
      localStorage.setItem('locale', 'en');
    });
    await page.goto('/data-transfer-calculator');
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Data Transfer Calculator/);
  });

  test('displays calculation mode selector', async ({ page }) => {
    await expect(page.getByTestId('mode-calculate-time')).toBeVisible();
    await expect(page.getByTestId('mode-calculate-speed')).toBeVisible();
    await expect(page.getByTestId('mode-calculate-size')).toBeVisible();
  });

  test('displays unit toggle switch', async ({ page }) => {
    await expect(page.getByTestId('unit-toggle')).toBeVisible();
  });

  test.describe('Calculate Time Mode', () => {
    test('displays data size and speed inputs', async ({ page }) => {
      await page.getByTestId('mode-calculate-time').click();

      await expect(page.getByTestId('data-size-input')).toBeVisible();
      await expect(page.getByTestId('data-size-unit-select')).toBeVisible();
      await expect(page.getByTestId('transfer-speed-input')).toBeVisible();
      await expect(page.getByTestId('transfer-speed-unit-select')).toBeVisible();
    });

    test('calculates transfer time correctly', async ({ page }) => {
      await page.getByTestId('mode-calculate-time').click();

      // Input 1 GB
      await page.getByTestId('data-size-input').fill('1');
      
      // Input 100 Mbit/s
      await page.getByTestId('transfer-speed-input').fill('100');

      // Wait for calculation
      await page.waitForTimeout(500);

      // Check if result is displayed
      await expect(page.getByTestId('result-card')).toBeVisible();
      await expect(page.getByTestId('formatted-time')).toBeVisible();
      await expect(page.getByTestId('time-in-seconds')).toBeVisible();
      await expect(page.getByTestId('time-in-minutes')).toBeVisible();
      await expect(page.getByTestId('time-in-hours')).toBeVisible();
      await expect(page.getByTestId('time-in-days')).toBeVisible();
    });

    test('handles zero speed gracefully', async ({ page }) => {
      await page.getByTestId('mode-calculate-time').click();

      await page.getByTestId('data-size-input').fill('100');
      await page.getByTestId('transfer-speed-input').fill('0');

      await page.waitForTimeout(500);

      // Should not display result for invalid input
      await expect(page.getByTestId('result-card')).not.toBeVisible();
    });
  });

  test.describe('Calculate Speed Mode', () => {
    test('displays data size and time inputs', async ({ page }) => {
      await page.getByTestId('mode-calculate-speed').click();

      await expect(page.getByTestId('data-size-input')).toBeVisible();
      await expect(page.getByTestId('data-size-unit-select')).toBeVisible();
      await expect(page.getByTestId('transfer-time-input')).toBeVisible();
      await expect(page.getByTestId('transfer-time-unit-select')).toBeVisible();
    });

    test('calculates required speed correctly', async ({ page }) => {
      await page.getByTestId('mode-calculate-speed').click();

      // Input 1 GB
      await page.getByTestId('data-size-input').fill('1');
      
      // Input 60 seconds
      await page.getByTestId('transfer-time-input').fill('60');

      // Wait for calculation
      await page.waitForTimeout(500);

      // Check if result is displayed
      await expect(page.getByTestId('result-card')).toBeVisible();
      await expect(page.getByTestId('speed-mbps')).toBeVisible();
      await expect(page.getByTestId('speed-mbitps')).toBeVisible();
    });
  });

  test.describe('Calculate Size Mode', () => {
    test('displays speed and time inputs', async ({ page }) => {
      await page.getByTestId('mode-calculate-size').click();

      await expect(page.getByTestId('transfer-speed-input')).toBeVisible();
      await expect(page.getByTestId('transfer-speed-unit-select')).toBeVisible();
      await expect(page.getByTestId('transfer-time-input')).toBeVisible();
      await expect(page.getByTestId('transfer-time-unit-select')).toBeVisible();
    });

    test('calculates transferable size correctly', async ({ page }) => {
      await page.getByTestId('mode-calculate-size').click();

      // Input 100 Mbit/s
      await page.getByTestId('transfer-speed-input').fill('100');
      
      // Input 60 seconds
      await page.getByTestId('transfer-time-input').fill('60');

      // Wait for calculation
      await page.waitForTimeout(500);

      // Check if result is displayed
      await expect(page.getByTestId('result-card')).toBeVisible();
      await expect(page.getByTestId('size-gb')).toBeVisible();
      await expect(page.getByTestId('size-mb')).toBeVisible();
    });
  });

  test.describe('Unit Toggle', () => {
    test('can toggle between original and translated units', async ({ page }) => {
      const unitToggle = page.getByTestId('unit-toggle');

      // Toggle should be checked by default (original units)
      await expect(unitToggle).toBeChecked();

      // Click to use translated units
      await unitToggle.click();
      await expect(unitToggle).not.toBeChecked();

      // Click to use original units again
      await unitToggle.click();
      await expect(unitToggle).toBeChecked();
    });
  });

  test.describe('Mode Switching', () => {
    test('can switch between calculation modes', async ({ page }) => {
      // Start with calculate time mode
      await page.getByTestId('mode-calculate-time').click();
      await expect(page.getByTestId('data-size-input')).toBeVisible();
      await expect(page.getByTestId('transfer-speed-input')).toBeVisible();

      // Switch to calculate speed mode
      await page.getByTestId('mode-calculate-speed').click();
      await expect(page.getByTestId('data-size-input')).toBeVisible();
      await expect(page.getByTestId('transfer-time-input')).toBeVisible();

      // Switch to calculate size mode
      await page.getByTestId('mode-calculate-size').click();
      await expect(page.getByTestId('transfer-speed-input')).toBeVisible();
      await expect(page.getByTestId('transfer-time-input')).toBeVisible();
    });
  });

  test.describe('Input Persistence', () => {
    test('persists input values on page reload', async ({ page }) => {
      await page.getByTestId('mode-calculate-time').click();

      // Set values
      await page.getByTestId('data-size-input').fill('500');
      await page.getByTestId('transfer-speed-input').fill('50');

      // Reload page
      await page.reload();

      // Values should be persisted
      await expect(page.getByTestId('data-size-input')).toHaveValue('500');
      await expect(page.getByTestId('transfer-speed-input')).toHaveValue('50');
    });
  });
});
