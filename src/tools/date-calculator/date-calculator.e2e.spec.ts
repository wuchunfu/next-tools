import { expect, test } from '@playwright/test'

test.describe('Tool - Date Calculator', () => {
  test.beforeEach(async ({ page }) => {
    // Set language to English for consistent testing
    await page.addInitScript(() => {
      localStorage.setItem('locale', 'en')
    })
    await page.goto('/date-calculator')
  })

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Date Calculator/i)
  })

  test('displays all three tabs', async ({ page }) => {
    await expect(page.getByTestId('tab-arithmetic')).toBeVisible()
    await expect(page.getByTestId('tab-difference')).toBeVisible()
    await expect(page.getByTestId('tab-conversion')).toBeVisible()
  })

  test.describe('Date Arithmetic Tab', () => {
    test('displays arithmetic form elements', async ({ page }) => {
      await page.getByTestId('tab-arithmetic').click()

      // Check all time unit inputs are visible
      await expect(page.getByTestId('arithmetic-years-input')).toBeVisible()
      await expect(page.getByTestId('arithmetic-months-input')).toBeVisible()
      await expect(page.getByTestId('arithmetic-weeks-input')).toBeVisible()
      await expect(page.getByTestId('arithmetic-days-input')).toBeVisible()
      await expect(page.getByTestId('arithmetic-hours-input')).toBeVisible()
      await expect(page.getByTestId('arithmetic-minutes-input')).toBeVisible()
      await expect(page.getByTestId('arithmetic-seconds-input')).toBeVisible()
      await expect(page.getByTestId('arithmetic-result')).toBeVisible()
    })

    test('can input single time unit and see result', async ({ page }) => {
      await page.getByTestId('tab-arithmetic').click()

      // Set days to 45
      await page.getByTestId('arithmetic-days-input').fill('45')

      // Result should be visible
      await expect(page.getByTestId('arithmetic-result')).toBeVisible()
    })

    test('can input multiple time units and see combined result', async ({ page }) => {
      await page.getByTestId('tab-arithmetic').click()

      // Set multiple units
      await page.getByTestId('arithmetic-years-input').fill('1')
      await page.getByTestId('arithmetic-months-input').fill('2')
      await page.getByTestId('arithmetic-days-input').fill('15')
      await page.getByTestId('arithmetic-hours-input').fill('3')

      // Result should be visible
      await expect(page.getByTestId('arithmetic-result')).toBeVisible()
    })

    test('can switch between add and subtract operations', async ({ page }) => {
      await page.getByTestId('tab-arithmetic').click()

      // Select add operation
      await page.getByRole('radio', { name: /add/i }).click()
      await expect(page.getByRole('radio', { name: /add/i })).toBeChecked()

      // Select subtract operation
      await page.getByRole('radio', { name: /subtract/i }).click()
      await expect(page.getByRole('radio', { name: /subtract/i })).toBeChecked()
    })
  })

  test.describe('Date Difference Tab', () => {
    test('displays all difference units', async ({ page }) => {
      await page.getByTestId('tab-difference').click()

      // Wait for difference results to be visible
      await page.waitForTimeout(500)

      await expect(page.getByTestId('formatted-difference')).toBeVisible()
      await expect(page.getByTestId('diff-years')).toBeVisible()
      await expect(page.getByTestId('diff-months')).toBeVisible()
      await expect(page.getByTestId('diff-weeks')).toBeVisible()
      await expect(page.getByTestId('diff-days')).toBeVisible()
      await expect(page.getByTestId('diff-hours')).toBeVisible()
      await expect(page.getByTestId('diff-minutes')).toBeVisible()
      await expect(page.getByTestId('diff-seconds')).toBeVisible()
    })

    test('difference results are readonly', async ({ page }) => {
      await page.getByTestId('tab-difference').click()

      // All difference result inputs should be readonly
      await expect(page.getByTestId('diff-years')).toHaveAttribute('readonly')
      await expect(page.getByTestId('diff-months')).toHaveAttribute('readonly')
      await expect(page.getByTestId('diff-weeks')).toHaveAttribute('readonly')
      await expect(page.getByTestId('diff-days')).toHaveAttribute('readonly')
      await expect(page.getByTestId('diff-hours')).toHaveAttribute('readonly')
      await expect(page.getByTestId('diff-minutes')).toHaveAttribute('readonly')
      await expect(page.getByTestId('diff-seconds')).toHaveAttribute('readonly')
    })
  })

  test.describe('Unit Conversion Tab', () => {
    test('displays conversion form elements', async ({ page }) => {
      await page.getByTestId('tab-conversion').click()

      await expect(page.getByTestId('conversion-amount-input')).toBeVisible()
      await expect(page.getByTestId('conversion-result')).toBeVisible()
    })

    test('conversion result is readonly', async ({ page }) => {
      await page.getByTestId('tab-conversion').click()

      // Result input should be readonly
      await expect(page.getByTestId('conversion-result')).toHaveAttribute('readonly')
    })

    test('can change conversion amount', async ({ page }) => {
      await page.getByTestId('tab-conversion').click()

      // Set amount to 5
      await page.getByTestId('conversion-amount-input').fill('5')

      // Result should update
      await expect(page.getByTestId('conversion-result')).toBeVisible()
      
      // Value should not be empty
      const value = await page.getByTestId('conversion-result').inputValue()
      expect(value).toBeTruthy()
    })

    test('handles decimal amounts', async ({ page }) => {
      await page.getByTestId('tab-conversion').click()

      await page.getByTestId('conversion-amount-input').fill('1.5')

      await expect(page.getByTestId('conversion-result')).toBeVisible()
      
      // Value should be formatted with 2 decimal places
      const value = await page.getByTestId('conversion-result').inputValue()
      expect(value).toMatch(/\d+\.\d{2}/)
    })

    test('result displays with 2 decimal places', async ({ page }) => {
      await page.getByTestId('tab-conversion').click()

      await page.getByTestId('conversion-amount-input').fill('3')

      const value = await page.getByTestId('conversion-result').inputValue()
      
      // Should have exactly 2 decimal places
      expect(value).toMatch(/^\d+\.\d{2}$/)
    })
  })

  test.describe('Tab Navigation', () => {
    test('can switch between tabs', async ({ page }) => {
      // Start on arithmetic tab
      await expect(page.getByTestId('content-arithmetic')).toBeVisible()

      // Switch to difference tab
      await page.getByTestId('tab-difference').click()
      await expect(page.getByTestId('content-difference')).toBeVisible()

      // Switch to conversion tab
      await page.getByTestId('tab-conversion').click()
      await expect(page.getByTestId('content-conversion')).toBeVisible()

      // Switch back to arithmetic tab
      await page.getByTestId('tab-arithmetic').click()
      await expect(page.getByTestId('content-arithmetic')).toBeVisible()
    })
  })

  test.describe('Validation', () => {
    test('accepts positive amounts in arithmetic', async ({ page }) => {
      await page.getByTestId('tab-arithmetic').click()

      await page.getByTestId('arithmetic-days-input').fill('10')
      await page.getByTestId('arithmetic-hours-input').fill('5')

      // Result should be visible (indicating valid input)
      await expect(page.getByTestId('arithmetic-result')).toBeVisible()
    })

    test('shows error for negative amount in conversion', async ({ page }) => {
      await page.getByTestId('tab-conversion').click()

      await page.getByTestId('conversion-amount-input').fill('-5')

      await expect(page.getByTestId('conversion-amount-input')).toHaveClass(/border-destructive/)
    })

    test('accepts decimal amounts in conversion', async ({ page }) => {
      await page.getByTestId('tab-conversion').click()

      await page.getByTestId('conversion-amount-input').fill('2.5')

      // Result should be visible (indicating valid input)
      await expect(page.getByTestId('conversion-result')).toBeVisible()
    })
  })
})
