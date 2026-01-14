import { expect, test } from '@playwright/test'

test.describe('Tool - ICO Generator', () => {
  test.beforeEach(async ({ page }) => {
    // Set language to English for consistent testing
    await page.addInitScript(() => {
      localStorage.setItem('locale', 'en')
    })
    await page.goto('/ico-generator')
  })

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/ICO Generator/)
  })

  test('displays upload and configuration cards', async ({ page }) => {
    // Check for upload card
    await expect(page.getByText('Upload Image')).toBeVisible()

    // Check for configuration card
    await expect(page.getByText('Configuration & Output')).toBeVisible()
  })

  test('displays status as Ready initially', async ({ page }) => {
    // Check initial status
    await expect(page.getByText('Ready')).toBeVisible()
  })

  test('displays all icon size checkboxes', async ({ page }) => {
    // Check for standard icon sizes
    await expect(page.getByText('16×16')).toBeVisible()
    await expect(page.getByText('24×24')).toBeVisible()
    await expect(page.getByText('32×32')).toBeVisible()
    await expect(page.getByText('48×48')).toBeVisible()
    await expect(page.getByText('64×64')).toBeVisible()
    await expect(page.getByText('128×128')).toBeVisible()
    await expect(page.getByText('256×256')).toBeVisible()
  })

  test('has default filename input', async ({ page }) => {
    const filenameInput = page.locator('input[placeholder="favicon"]')
    await expect(filenameInput).toBeVisible()
    await expect(filenameInput).toHaveValue('favicon')
  })

  test('generate button is disabled initially', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: /Generate ICO/i })
    await expect(generateButton).toBeDisabled()
  })

  test('shows upload hint text', async ({ page }) => {
    await expect(page.getByText(/Click or drag to upload/i)).toBeVisible()
    await expect(page.getByText(/Supports PNG, JPEG/i)).toBeVisible()
  })

  test('displays no file selected message initially', async ({ page }) => {
    await expect(page.getByText('No file selected')).toBeVisible()
  })

  test('shows selected count for icon sizes', async ({ page }) => {
    // Should show default selected count (4 sizes: 16, 32, 48, 256)
    await expect(page.getByText(/4 selected/i)).toBeVisible()
  })

  test('can change filename', async ({ page }) => {
    const filenameInput = page.locator('input[placeholder="favicon"]')
    await filenameInput.fill('my-icon')
    await expect(filenameInput).toHaveValue('my-icon')
  })

  test('can toggle icon size checkboxes', async ({ page }) => {
    // Find the 24x24 checkbox (which is disabled by default)
    const checkbox24 = page.locator('input[id="size-24"]')

    // Check if initially unchecked
    await expect(checkbox24).not.toBeChecked()

    // Click the checkbox
    await checkbox24.check()

    // Verify it's now checked
    await expect(checkbox24).toBeChecked()

    // Verify selected count increased
    await expect(page.getByText(/5 selected/i)).toBeVisible()
  })

  test('displays file info section', async ({ page }) => {
    await expect(page.getByText('File Information')).toBeVisible()
  })

  test('displays icon sizes section', async ({ page }) => {
    await expect(page.getByText('Icon Sizes')).toBeVisible()
  })

  test('displays output filename section', async ({ page }) => {
    await expect(page.getByText('Output Filename')).toBeVisible()
  })

  test('displays custom size input field', async ({ page }) => {
    const customSizeInput = page.locator('input[placeholder*="32"]')
    await expect(customSizeInput).toBeVisible()
  })

  test('can add a custom size', async ({ page }) => {
    const customSizeInput = page.locator('input[placeholder*="32"]')
    const addButton = page.getByRole('button').filter({ has: page.locator('svg') }).first()

    // Add a custom size
    await customSizeInput.fill('64')
    await addButton.click()

    // Verify the custom size appears
    await expect(page.getByText('64×64')).toBeVisible()

    // Verify selected count increased (4 default + 1 custom = 5)
    await expect(page.getByText(/5 selected/i)).toBeVisible()
  })

  test('can add custom size with width x height format', async ({ page }) => {
    const customSizeInput = page.locator('input[placeholder*="32"]')
    const addButton = page.getByRole('button').filter({ has: page.locator('svg') }).first()

    // Add a custom size with width x height
    await customSizeInput.fill('80x60')
    await addButton.click()

    // Verify the custom size appears
    await expect(page.getByText('80×60')).toBeVisible()
  })

  test('can remove a custom size', async ({ page }) => {
    const customSizeInput = page.locator('input[placeholder*="32"]')
    const addButton = page.getByRole('button').filter({ has: page.locator('svg') }).first()

    // Add a custom size
    await customSizeInput.fill('72')
    await addButton.click()

    // Verify it appears
    await expect(page.getByText('72×72')).toBeVisible()

    // Find and click the remove button (X icon) for this custom size
    const customSizeContainer = page.locator('div').filter({ hasText: /^72×72$/ }).first()
    const removeButton = customSizeContainer.locator('button').last()
    await removeButton.click()

    // Verify the custom size is removed
    await expect(page.getByText('72×72')).not.toBeVisible()
  })

  test('can toggle custom size checkbox', async ({ page }) => {
    const customSizeInput = page.locator('input[placeholder*="32"]')
    const addButton = page.getByRole('button').filter({ has: page.locator('svg') }).first()

    // Add a custom size (it's selected by default)
    await customSizeInput.fill('96')
    await addButton.click()

    // Find the checkbox for the custom size
    const customCheckbox = page.locator('input[id*="custom-size-96"]')
    await expect(customCheckbox).toBeChecked()

    // Uncheck it
    await customCheckbox.uncheck()
    await expect(customCheckbox).not.toBeChecked()

    // Verify selected count decreased
    await expect(page.getByText(/3 selected/i)).toBeVisible()
  })

  test('can clear all custom sizes', async ({ page }) => {
    const customSizeInput = page.locator('input[placeholder*="32"]')
    const addButton = page.getByRole('button').filter({ has: page.locator('svg') }).first()

    // Add multiple custom sizes
    await customSizeInput.fill('100')
    await addButton.click()
    await customSizeInput.fill('200')
    await addButton.click()

    // Verify they appear
    await expect(page.getByText('100×100')).toBeVisible()
    await expect(page.getByText('200×200')).toBeVisible()

    // Click clear all button
    const clearButton = page.getByRole('button', { name: /clear/i })
    await clearButton.click()

    // Verify custom sizes are removed
    await expect(page.getByText('100×100')).not.toBeVisible()
    await expect(page.getByText('200×200')).not.toBeVisible()

    // Verify selected count is back to default (4)
    await expect(page.getByText(/4 selected/i)).toBeVisible()
  })
})
