import { expect, test } from '@playwright/test'

test.describe('Tool - URL Parser', () => {
  test.beforeEach(async ({ page }) => {
    // Set language to English for consistent testing
    await page.addInitScript(() => {
      localStorage.setItem('locale', 'en')
    })
    await page.goto('/url-parser')
  })

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/URL Parser/i)
  })

  test('displays input and output cards', async ({ page }) => {
    // Input card should be visible
    await expect(page.getByTestId('input-card')).toBeVisible()

    // Output card should not be visible initially
    await expect(page.getByTestId('output-card')).not.toBeVisible()
  })

  test('displays input field and clear button', async ({ page }) => {
    await expect(page.getByTestId('url-input')).toBeVisible()
    await expect(page.getByTestId('clear-btn')).toBeVisible()
  })

  test('can input a URL', async ({ page }) => {
    await page.getByTestId('url-input').fill('https://example.com')
    await expect(page.getByTestId('url-input')).toHaveValue('https://example.com')
  })

  test('can clear input', async ({ page }) => {
    // Fill input
    await page.getByTestId('url-input').fill('https://example.com')
    await expect(page.getByTestId('url-input')).toHaveValue('https://example.com')

    // Click clear button
    await page.getByTestId('clear-btn').click()

    // Input should be empty
    await expect(page.getByTestId('url-input')).toHaveValue('')
  })

  test('shows error for invalid URL', async ({ page }) => {
    // Enter invalid URL
    await page.getByTestId('url-input').fill('not a valid url')

    // Error message should be visible
    await expect(page.getByTestId('error-alert')).toBeVisible()
  })

  test('parses simple URL correctly', async ({ page }) => {
    // Enter a simple URL
    await page.getByTestId('url-input').fill('https://example.com/path')

    // Output card should be visible
    await expect(page.getByTestId('output-card')).toBeVisible()

    // Check URL components section is visible
    await expect(page.getByTestId('url-components-section')).toBeVisible()

    // Protocol should be displayed
    await expect(page.getByTestId('component-protocol')).toBeVisible()

    // Hostname should be displayed
    await expect(page.getByTestId('component-hostname')).toBeVisible()

    // Path should be displayed
    await expect(page.getByTestId('component-pathname')).toBeVisible()
  })

  test('parses URL with all components', async ({ page }) => {
    // Enter URL with all components
    await page.getByTestId('url-input').fill('https://user:pass@example.com:8080/path?key=value#hash')

    // Output card should be visible
    await expect(page.getByTestId('output-card')).toBeVisible()

    // All components should be visible
    await expect(page.getByTestId('component-protocol')).toBeVisible()
    await expect(page.getByTestId('component-username')).toBeVisible()
    await expect(page.getByTestId('component-password')).toBeVisible()
    await expect(page.getByTestId('component-hostname')).toBeVisible()
    await expect(page.getByTestId('component-port')).toBeVisible()
    await expect(page.getByTestId('component-pathname')).toBeVisible()
    await expect(page.getByTestId('component-hash')).toBeVisible()
  })

  test('parses query parameters correctly', async ({ page }) => {
    // Enter URL with query parameters
    await page.getByTestId('url-input').fill('https://example.com?foo=bar&baz=qux')

    // Query parameters section should be visible
    await expect(page.getByTestId('query-params-section')).toBeVisible()

    // Search string should be displayed
    await expect(page.getByTestId('search-string')).toBeVisible()

    // Individual parameters should be visible
    await expect(page.getByTestId('param-foo')).toBeVisible()
    await expect(page.getByTestId('param-baz')).toBeVisible()
  })

  test('handles duplicate query parameter keys with array indexing', async ({ page }) => {
    // Enter URL with duplicate keys
    await page.getByTestId('url-input').fill('https://example.com?key=value1&key=value2')

    // Query parameters section should be visible
    await expect(page.getByTestId('query-params-section')).toBeVisible()

    // Parameters with array indexing should be visible
    await expect(page.getByTestId('param-key[0]')).toBeVisible()
    await expect(page.getByTestId('param-key[1]')).toBeVisible()
  })

  test('handles complex URL with mixed parameters', async ({ page }) => {
    // Enter complex URL
    await page.getByTestId('url-input').fill('https://example.com?single=value&arr=val1&arr=val2&other=data')

    // Query parameters section should be visible
    await expect(page.getByTestId('query-params-section')).toBeVisible()

    // Single parameter should not have index
    await expect(page.getByTestId('param-single')).toBeVisible()

    // Duplicate parameters should have array indexing
    await expect(page.getByTestId('param-arr[0]')).toBeVisible()
    await expect(page.getByTestId('param-arr[1]')).toBeVisible()

    // Other single parameter should not have index
    await expect(page.getByTestId('param-other')).toBeVisible()
  })

  test('handles URL from example in requirements', async ({ page }) => {
    // Enter the exact URL from requirements
    await page.getByTestId('url-input').fill('https://me:pwd@sharevb-it-tools.vercel.app:3000/url-parser?key=value&keyarr=value1&keyarr=value2&otherarg#the-hash')

    // Output card should be visible
    await expect(page.getByTestId('output-card')).toBeVisible()

    // Check all components are parsed
    await expect(page.getByTestId('component-protocol')).toBeVisible()
    await expect(page.getByTestId('component-username')).toBeVisible()
    await expect(page.getByTestId('component-password')).toBeVisible()
    await expect(page.getByTestId('component-hostname')).toBeVisible()
    await expect(page.getByTestId('component-port')).toBeVisible()
    await expect(page.getByTestId('component-pathname')).toBeVisible()
    await expect(page.getByTestId('component-hash')).toBeVisible()

    // Check query parameters with array indexing
    await expect(page.getByTestId('query-params-section')).toBeVisible()
    await expect(page.getByTestId('param-key')).toBeVisible()
    await expect(page.getByTestId('param-keyarr[0]')).toBeVisible()
    await expect(page.getByTestId('param-keyarr[1]')).toBeVisible()
    await expect(page.getByTestId('param-otherarg')).toBeVisible()
  })

  test('hides query parameters section when no parameters', async ({ page }) => {
    // Enter URL without query parameters
    await page.getByTestId('url-input').fill('https://example.com/path')

    // Output card should be visible
    await expect(page.getByTestId('output-card')).toBeVisible()

    // Query parameters section should not be visible
    await expect(page.getByTestId('query-params-section')).not.toBeVisible()
  })

  test('updates output when URL changes', async ({ page }) => {
    // Enter first URL
    await page.getByTestId('url-input').fill('https://example.com')

    // Output should be visible
    await expect(page.getByTestId('output-card')).toBeVisible()

    // Change URL
    await page.getByTestId('url-input').fill('https://different.com:8080')

    // Output should update with new port
    await expect(page.getByTestId('component-port')).toBeVisible()
  })

  test('handles localhost URLs', async ({ page }) => {
    // Enter localhost URL
    await page.getByTestId('url-input').fill('http://localhost:3000/api')

    // Output card should be visible
    await expect(page.getByTestId('output-card')).toBeVisible()

    // Components should be parsed correctly
    await expect(page.getByTestId('component-hostname')).toBeVisible()
    await expect(page.getByTestId('component-port')).toBeVisible()
    await expect(page.getByTestId('component-pathname')).toBeVisible()
  })

  test('handles IP address URLs', async ({ page }) => {
    // Enter IP address URL
    await page.getByTestId('url-input').fill('http://192.168.1.1:8080')

    // Output card should be visible
    await expect(page.getByTestId('output-card')).toBeVisible()

    // Components should be parsed correctly
    await expect(page.getByTestId('component-hostname')).toBeVisible()
    await expect(page.getByTestId('component-port')).toBeVisible()
  })

  test('handles URL-encoded query parameters', async ({ page }) => {
    // Enter URL with encoded parameters
    await page.getByTestId('url-input').fill('https://example.com?message=hello%20world')

    // Query parameters section should be visible
    await expect(page.getByTestId('query-params-section')).toBeVisible()

    // Parameter should be visible
    await expect(page.getByTestId('param-message')).toBeVisible()
  })

  test('handles empty query parameter values', async ({ page }) => {
    // Enter URL with empty parameter value
    await page.getByTestId('url-input').fill('https://example.com?key=&other=value')

    // Query parameters section should be visible
    await expect(page.getByTestId('query-params-section')).toBeVisible()

    // Both parameters should be visible
    await expect(page.getByTestId('param-key')).toBeVisible()
    await expect(page.getByTestId('param-other')).toBeVisible()
  })

  test('handles many duplicate keys', async ({ page }) => {
    // Enter URL with many duplicate keys
    await page.getByTestId('url-input').fill('https://example.com?id=1&id=2&id=3&id=4&id=5')

    // Query parameters section should be visible
    await expect(page.getByTestId('query-params-section')).toBeVisible()

    // All indexed parameters should be visible
    await expect(page.getByTestId('param-id[0]')).toBeVisible()
    await expect(page.getByTestId('param-id[1]')).toBeVisible()
    await expect(page.getByTestId('param-id[2]')).toBeVisible()
    await expect(page.getByTestId('param-id[3]')).toBeVisible()
    await expect(page.getByTestId('param-id[4]')).toBeVisible()
  })

  test('handles different protocols', async ({ page }) => {
    // Test FTP protocol
    await page.getByTestId('url-input').fill('ftp://ftp.example.com/file.zip')

    // Output card should be visible
    await expect(page.getByTestId('output-card')).toBeVisible()

    // Protocol should be displayed
    await expect(page.getByTestId('component-protocol')).toBeVisible()
  })

  test('clears output when input is cleared', async ({ page }) => {
    // Enter URL
    await page.getByTestId('url-input').fill('https://example.com')

    // Output should be visible
    await expect(page.getByTestId('output-card')).toBeVisible()

    // Clear input
    await page.getByTestId('clear-btn').click()

    // Output should be hidden
    await expect(page.getByTestId('output-card')).not.toBeVisible()
  })

  test('shows error and hides output for invalid URL', async ({ page }) => {
    // Enter valid URL first
    await page.getByTestId('url-input').fill('https://example.com')

    // Output should be visible
    await expect(page.getByTestId('output-card')).toBeVisible()

    // Change to invalid URL
    await page.getByTestId('url-input').fill('invalid url')

    // Error should be visible
    await expect(page.getByTestId('error-alert')).toBeVisible()

    // Output should be hidden
    await expect(page.getByTestId('output-card')).not.toBeVisible()
  })
})

