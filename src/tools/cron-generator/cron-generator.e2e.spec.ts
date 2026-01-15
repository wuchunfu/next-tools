import { expect, test } from '@playwright/test';

test.describe('Tool - Cron Generator', () => {
  test.beforeEach(async ({ page }) => {
    // Set language to English for consistent testing
    await page.addInitScript(() => {
      localStorage.setItem('locale', 'en');
    });
    await page.goto('/cron-generator');
  });

  test('displays cron input field with default value', async ({ page }) => {
    const cronInput = page.getByTestId('cron-input');
    await expect(cronInput).toBeVisible();
    await expect(cronInput).toHaveValue('* * * * * *');
  });

  test('displays human readable output for valid cron', async ({ page }) => {
    const humanReadable = page.getByTestId('cron-human-readable');
    await expect(humanReadable).toBeVisible();
  });

  test('shows error for invalid cron expression', async ({ page }) => {
    const cronInput = page.getByTestId('cron-input');

    // Enter invalid cron
    await cronInput.fill('invalid cron');

    // Check for error message
    const errorMessage = page.getByTestId('cron-error');
    await expect(errorMessage).toBeVisible();

    // Check for error alert
    const errorAlert = page.getByTestId('cron-invalid-alert');
    await expect(errorAlert).toBeVisible();
  });

  test('can copy cron expression', async ({ page }) => {
    // Wait for hydration to settle
    const cronInput = page.getByTestId('cron-input');
    await expect(cronInput).toHaveValue(/./);

    const copyBtn = page.getByTestId('copy-cron-btn');
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    // Note: Actual clipboard testing requires additional setup
    // This just verifies the button is clickable
  });

  test('can open preset selector', async ({ page }) => {
    // Wait for hydration to settle
    const cronInput = page.getByTestId('cron-input');
    await expect(cronInput).toHaveValue(/./);

    const presetBtn = page.getByTestId('preset-btn');
    await expect(presetBtn).toBeVisible();

    await presetBtn.click();

    // Check if preset popover is visible (combobox input)
    await expect(page.getByRole('combobox')).toBeVisible();
  });

  test('displays generator card', async ({ page }) => {
    await expect(page.getByTestId('generator-card')).toBeVisible();
  });

  test('displays all generator tabs', async ({ page }) => {
    // Check for all field tabs
    await expect(page.getByTestId('tab-second')).toBeVisible();
    await expect(page.getByTestId('tab-minute')).toBeVisible();
    await expect(page.getByTestId('tab-hour')).toBeVisible();
    await expect(page.getByTestId('tab-day')).toBeVisible();
    await expect(page.getByTestId('tab-month')).toBeVisible();
    await expect(page.getByTestId('tab-week')).toBeVisible();
  });

  test('can switch between generator tabs', async ({ page }) => {
    const minuteTab = page.getByTestId('tab-minute');
    const hourTab = page.getByTestId('tab-hour');

    // Click minute tab
    await minuteTab.click();
    await expect(page.getByTestId('minute-mode-every')).toBeVisible();

    // Click hour tab
    await hourTab.click();
    await expect(page.getByTestId('hour-mode-every')).toBeVisible();
  });

  test('displays all field modes for second field', async ({ page }) => {
    const secondTab = page.getByTestId('tab-second');
    await secondTab.click();

    // Check for all mode options
    await expect(page.getByTestId('second-mode-every')).toBeVisible();
    await expect(page.getByTestId('second-mode-range')).toBeVisible();
    await expect(page.getByTestId('second-mode-interval')).toBeVisible();
    await expect(page.getByTestId('second-mode-specific')).toBeVisible();
  });

  test('can select range mode and set values', async ({ page }) => {
    const cronInput = page.getByTestId('cron-input');
    const secondTab = page.getByTestId('tab-second');

    await secondTab.click();

    // Select range mode
    const rangeMode = page.getByTestId('second-mode-range');
    await rangeMode.getByRole('radio').click();

    // Set range values
    const rangeStart = page.getByTestId('second-range-start');
    const rangeEnd = page.getByTestId('second-range-end');

    await rangeStart.fill('10');
    await rangeEnd.fill('20');

    // Verify cron expression updated
    await expect(cronInput).toHaveValue(/10-20/);
  });

  test('can select interval mode and set values', async ({ page }) => {
    const cronInput = page.getByTestId('cron-input');
    const minuteTab = page.getByTestId('tab-minute');

    await minuteTab.click();

    // Select interval mode
    const intervalMode = page.getByTestId('minute-mode-interval');
    await intervalMode.getByRole('radio').click();

    // Set interval values
    const intervalStart = page.getByTestId('minute-interval-start');
    const intervalStep = page.getByTestId('minute-interval-step');

    await intervalStart.fill('0');
    await intervalStep.fill('5');

    // Verify cron expression updated (should contain */5 or 0/5)
    await expect(cronInput).toHaveValue(/\*\/5|0\/5/);
  });

  test('can update cron expression manually', async ({ page }) => {
    const cronInput = page.getByTestId('cron-input');

    // Change to a different valid cron expression
    await cronInput.fill('0 0 12 * * *');

    // Verify human readable output is visible (content will be in user's language)
    const humanReadable = page.getByTestId('cron-human-readable');
    await expect(humanReadable).toBeVisible();
  });
});
