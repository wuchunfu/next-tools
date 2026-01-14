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
    // Upload card
    await expect(page.getByRole('heading', { name: 'Upload Image' })).toBeVisible()

    // Configuration card
    await expect(page.getByRole('heading', { name: 'Configuration & Output' })).toBeVisible()
  })

  test('displays status as Ready initially', async ({ page }) => {
    const statusValue = page.getByTestId('status-value')
    await expect(statusValue).toContainText('Ready')
  })

  test('displays all icon size checkboxes', async ({ page }) => {
    const grid = page.getByTestId('standard-sizes-grid')

    // Check for all 7 standard sizes
    await expect(grid.getByTestId('checkbox-size-16')).toBeVisible()
    await expect(grid.getByTestId('checkbox-size-24')).toBeVisible()
    await expect(grid.getByTestId('checkbox-size-32')).toBeVisible()
    await expect(grid.getByTestId('checkbox-size-48')).toBeVisible()
    await expect(grid.getByTestId('checkbox-size-64')).toBeVisible()
    await expect(grid.getByTestId('checkbox-size-128')).toBeVisible()
    await expect(grid.getByTestId('checkbox-size-256')).toBeVisible()
  })

  test('has default filename input', async ({ page }) => {
    const filenameInput = page.getByTestId('output-filename-input')
    await expect(filenameInput).toBeVisible()
    await expect(filenameInput).toHaveAttribute('placeholder', 'favicon')
  })

  test('generate button is disabled initially', async ({ page }) => {
    const generateBtn = page.getByTestId('generate-btn')
    await expect(generateBtn).toBeDisabled()
  })

  test('shows upload hint text', async ({ page }) => {
    await expect(page.getByText('Click or drag to upload an image')).toBeVisible()
    await expect(page.getByText('Supports PNG, JPEG, and other image formats')).toBeVisible()
  })

  test('displays no file selected message initially', async ({ page }) => {
    const noFileMsg = page.getByTestId('no-file-message')
    await expect(noFileMsg).toBeVisible()
    await expect(noFileMsg).toContainText('No file selected')
  })

  test('shows selected count for icon sizes', async ({ page }) => {
    const selectedCount = page.getByTestId('selected-count')
    await expect(selectedCount).toContainText('4 selected')
  })

  test('can change filename', async ({ page }) => {
    const filenameInput = page.getByTestId('output-filename-input')
    await filenameInput.fill('my-icon')
    await expect(filenameInput).toHaveValue('my-icon')
  })

  test('can toggle icon size checkboxes', async ({ page }) => {
    const checkbox24 = page.getByTestId('checkbox-size-24')
    const selectedCount = page.getByTestId('selected-count')

    // Initially unchecked
    await expect(checkbox24).not.toBeChecked()
    await expect(selectedCount).toContainText('4 selected')

    // Check it
    await checkbox24.check()
    await expect(checkbox24).toBeChecked()
    await expect(selectedCount).toContainText('5 selected')
  })

  test('displays file info section', async ({ page }) => {
    const fileInfoLabel = page.getByTestId('file-info-label')
    await expect(fileInfoLabel).toContainText('File Information')
  })

  test('displays icon sizes section', async ({ page }) => {
    const iconSizesLabel = page.getByTestId('icon-sizes-label')
    await expect(iconSizesLabel).toContainText('Icon Sizes')
  })

  test('displays output filename section', async ({ page }) => {
    const filenameLabel = page.getByTestId('output-filename-label')
    await expect(filenameLabel).toContainText('Output Filename')
  })

  test('displays custom size input field', async ({ page }) => {
    const customSizeInput = page.getByTestId('custom-size-input')
    await expect(customSizeInput).toBeVisible()
  })

  test('can add a custom size', async ({ page }) => {
    const customSizeInput = page.getByTestId('custom-size-input')
    const addButton = page.getByTestId('add-custom-size-btn')
    const selectedCount = page.getByTestId('selected-count')

    // Add a custom size (use a size not in standard list)
    await customSizeInput.fill('80')
    await addButton.click()

    // Verify the custom size appears
    const customSizesList = page.getByTestId('custom-sizes-list')
    await expect(customSizesList).toBeVisible()
    const customSizeItem = page.getByTestId('custom-size-item-80x80')
    await expect(customSizeItem).toBeVisible()

    // Verify selected count increased (4 default + 1 custom = 5)
    await expect(selectedCount).toContainText('5 selected')
  })

  test('can add custom size with width x height format', async ({ page }) => {
    const customSizeInput = page.getByTestId('custom-size-input')
    const addButton = page.getByTestId('add-custom-size-btn')

    // Add a custom size with width x height (use non-square size)
    await customSizeInput.fill('80x60')
    await addButton.click()

    // Verify the custom size appears
    const customSizeItem = page.getByTestId('custom-size-item-80x60')
    await expect(customSizeItem).toBeVisible()
  })

  test('can remove a custom size', async ({ page }) => {
    const customSizeInput = page.getByTestId('custom-size-input')
    const addButton = page.getByTestId('add-custom-size-btn')

    // Add a custom size
    await customSizeInput.fill('72')
    await addButton.click()

    // Verify it appears
    const customSizeItem = page.getByTestId('custom-size-item-72x72')
    await expect(customSizeItem).toBeVisible()

    // Click remove button
    const removeButton = page.getByTestId('remove-custom-size-72x72')
    await removeButton.click()

    // Verify the custom size is removed
    await expect(customSizeItem).not.toBeVisible()
  })

  test('can toggle custom size checkbox', async ({ page }) => {
    const customSizeInput = page.getByTestId('custom-size-input')
    const addButton = page.getByTestId('add-custom-size-btn')
    const selectedCount = page.getByTestId('selected-count')

    // Add a custom size (it's selected by default)
    await customSizeInput.fill('96')
    await addButton.click()

    // Wait for the custom size to appear
    const customSizeItem = page.getByTestId('custom-size-item-96x96')
    await expect(customSizeItem).toBeVisible()

    // Find the checkbox for the custom size
    const customCheckbox = page.getByTestId('checkbox-custom-96x96')
    await expect(customCheckbox).toBeChecked()
    await expect(selectedCount).toContainText('5 selected')

    // Uncheck it
    await customCheckbox.uncheck()
    await expect(customCheckbox).not.toBeChecked()

    // Verify selected count decreased (back to 4 default)
    await expect(selectedCount).toContainText('4 selected')
  })

  test('can clear all custom sizes', async ({ page }) => {
    const customSizeInput = page.getByTestId('custom-size-input')
    const addButton = page.getByTestId('add-custom-size-btn')
    const selectedCount = page.getByTestId('selected-count')

    // Add multiple custom sizes
    await customSizeInput.fill('100')
    await addButton.click()
    await customSizeInput.fill('200')
    await addButton.click()

    // Verify they appear
    await expect(page.getByTestId('custom-size-item-100x100')).toBeVisible()
    await expect(page.getByTestId('custom-size-item-200x200')).toBeVisible()
    await expect(selectedCount).toContainText('6 selected')

    // Click clear all button
    const clearButton = page.getByTestId('clear-all-custom-sizes-btn')
    await clearButton.click()

    // Verify custom sizes are removed
    await expect(page.getByTestId('custom-sizes-section')).not.toBeVisible()

    // Verify selected count is back to default (4)
    await expect(selectedCount).toContainText('4 selected')
  })
})
