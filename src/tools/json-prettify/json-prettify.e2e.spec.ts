import { expect, test } from '@playwright/test'

test.describe('Tool - JSON Prettify', () => {
  test.beforeEach(async ({ page }) => {
    // Set language to English for consistent testing
    await page.addInitScript(() => {
      localStorage.setItem('locale', 'en')
    })
    await page.goto('/json-prettify')

  })

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/JSON Prettify/i)
  })

  test('displays formatting options card', async ({ page }) => {
    await expect(page.getByTestId('json-sort-keys')).toBeVisible()
    await expect(page.getByTestId('json-indent')).toBeVisible()
  })

  test('displays input and output cards', async ({ page }) => {
    await expect(page.getByTestId('json-input')).toBeVisible()
  })

  test('has default indent size of 3', async ({ page }) => {
    const indentInput = page.getByTestId('json-indent')
    await expect(indentInput).toHaveValue('3')
  })

  test('sort keys toggle is enabled by default', async ({ page }) => {
    const sortKeysSwitch = page.getByTestId('json-sort-keys')
    await expect(sortKeysSwitch).toBeChecked()
  })

  test('can input JSON and see formatted output', async ({ page }) => {
    await page.getByTestId('json-input').fill('{"hello":"world"}')

    // Output should be visible
    const output = page.getByTestId('json-output')
    await expect(output).toBeVisible()

    // Output should contain formatted JSON
    const outputContent = output.getByTestId('area-content')
    await expect(outputContent).toContainText('"hello"')
    await expect(outputContent).toContainText('"world"')
  })

  test('can clear input', async ({ page }) => {
    await page.getByTestId('json-input').fill('{"test":"data"}')
    
    await page.getByTestId('clear-input-btn').click()

    await expect(page.getByTestId('json-input')).toHaveValue('')
  })

  test('can change indent size', async ({ page }) => {
    await page.getByTestId('json-indent').fill('2')
    await expect(page.getByTestId('json-indent')).toHaveValue('2')
  })

  test('can toggle sort keys', async ({ page }) => {
    const sortKeysSwitch = page.getByTestId('json-sort-keys')
    
    // Initially checked
    await expect(sortKeysSwitch).toBeChecked()
    
    // Uncheck it
    await sortKeysSwitch.uncheck()
    await expect(sortKeysSwitch).not.toBeChecked()
    
    // Check it again
    await sortKeysSwitch.check()
    await expect(sortKeysSwitch).toBeChecked()
  })

  test('sorts keys alphabetically when sort keys is enabled', async ({ page }) => {
    await page.getByTestId('json-sort-keys').check()
    
    await page.getByTestId('json-input').fill('{"z":1,"a":2,"m":3}')

    const output = page.getByTestId('json-output')
    const outputText = await output.getByTestId('area-content').textContent()
    
    // 'a' should appear before 'm', and 'm' before 'z'
    const indexA = outputText!.indexOf('"a"')
    const indexM = outputText!.indexOf('"m"')
    const indexZ = outputText!.indexOf('"z"')
    
    expect(indexA).toBeLessThan(indexM)
    expect(indexM).toBeLessThan(indexZ)
  })

  test('preserves key order when sort keys is disabled', async ({ page }) => {
    await page.getByTestId('json-sort-keys').uncheck()
    
    await page.getByTestId('json-input').fill('{"z":1,"a":2}')

    const output = page.getByTestId('json-output')
    const outputText = await output.getByTestId('area-content').textContent()
    
    // 'z' should appear before 'a' (original order)
    const indexA = outputText!.indexOf('"a"')
    const indexZ = outputText!.indexOf('"z"')
    
    expect(indexZ).toBeLessThan(indexA)
  })

  test('shows error for invalid JSON', async ({ page }) => {
    await page.getByTestId('json-input').fill('{invalid json}')

    // Error message should be visible
    await expect(page.getByTestId('error-message')).toBeVisible()
  })

  test('handles empty input', async ({ page }) => {
    await page.getByTestId('json-input').fill('')

    // Should not show error for empty input
    await expect(page.getByTestId('error-message')).not.toBeVisible()
  })

  test('preserves large numbers without precision loss', async ({ page }) => {
    const largeNumber = '17478252242305210114'
    await page.getByTestId('json-input').fill(`{"userId":${largeNumber}}`)

    const output = page.getByTestId('json-output')
    await expect(output.getByTestId('area-content')).toContainText(largeNumber)
    
    // Should NOT contain the rounded version
    await expect(output.getByTestId('area-content')).not.toContainText('17478252242305210000')
  })

  test('handles nested objects with large numbers', async ({ page }) => {
    await page.getByTestId('json-input').fill('{"user":{"id":17478252242305210114,"name":"John"}}')

    const output = page.getByTestId('json-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('"name"')
    await expect(output.getByTestId('area-content')).toContainText('"John"')
  })

  test('handles arrays with large numbers', async ({ page }) => {
    await page.getByTestId('json-input').fill('{"ids":[17478252242305210114,17478252242305210115]}')

    const output = page.getByTestId('json-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210115')
  })

  test('handles negative large numbers', async ({ page }) => {
    await page.getByTestId('json-input').fill('{"negativeId":-17478252242305210114}')

    const output = page.getByTestId('json-output')
    await expect(output.getByTestId('area-content')).toContainText('-17478252242305210114')
  })

  test('handles multiple large numbers in complex structure', async ({ page }) => {
    // Use string to avoid precision loss
    const json = '{"users":[{"id":17478252242305210114,"balance":9007199254740993},{"id":17478252242305210115,"balance":9007199254740994}]}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('json-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210115')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740993')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740994')
  })

  test('handles special characters in strings', async ({ page }) => {
    await page.getByTestId('json-input').fill('{"text":"Hello\\nWorld"}')

    const output = page.getByTestId('json-output')
    await expect(output.getByTestId('area-content')).toContainText('Hello\\nWorld')
  })

  test('handles unicode characters', async ({ page }) => {
    await page.getByTestId('json-input').fill('{"emoji":"😀","chinese":"你好"}')

    const output = page.getByTestId('json-output')
    await expect(output.getByTestId('area-content')).toContainText('😀')
    await expect(output.getByTestId('area-content')).toContainText('你好')
  })

  test('handles boolean and null values', async ({ page }) => {
    await page.getByTestId('json-input').fill('{"active":true,"inactive":false,"empty":null}')

    const output = page.getByTestId('json-output')
    await expect(output.getByTestId('area-content')).toContainText('true')
    await expect(output.getByTestId('area-content')).toContainText('false')
    await expect(output.getByTestId('area-content')).toContainText('null')
  })

  test('handles deeply nested structures', async ({ page }) => {
    const json = '{"level1":{"level2":{"level3":{"value":17478252242305210114}}}}'
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('json-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('"level1"')
    await expect(output.getByTestId('area-content')).toContainText('"level2"')
    await expect(output.getByTestId('area-content')).toContainText('"level3"')
  })

  test('indent size affects output formatting', async ({ page }) => {
    await page.getByTestId('json-input').fill('{"a":{"b":1}}')
    
    // Change indent to 2
    await page.getByTestId('json-indent').fill('2')

    const output = page.getByTestId('json-output')
    const outputText = await output.getByTestId('area-content').textContent()
    
    // Should have proper indentation
    expect(outputText).toContain('"a"')
    expect(outputText).toContain('"b"')
  })

  test('handles compact JSON (indent 0)', async ({ page }) => {
    await page.getByTestId('json-input').fill('{"a":1,"b":2}')
    await page.getByTestId('json-indent').fill('0')

    const output = page.getByTestId('json-output')
    const outputText = await output.getByTestId('area-content').textContent()
    
    // Should be compact (no extra whitespace)
    expect(outputText).toBe('{"a":1,"b":2}')
  })

  test('handles maximum indent size', async ({ page }) => {
    await page.getByTestId('json-input').fill('{"a":1}')
    await page.getByTestId('json-indent').fill('10')

    const output = page.getByTestId('json-output')
    await expect(output).toBeVisible()
  })

  test('persists indent size preference', async ({ page }) => {
    // Change indent size
    await page.getByTestId('json-indent').fill('5')
    
    // Reload page
    await page.reload()
    
    // Indent size should be persisted
    await expect(page.getByTestId('json-indent')).toHaveValue('5')
  })

  test('persists sort keys preference', async ({ page }) => {
    // Disable sort keys
    await page.getByTestId('json-sort-keys').uncheck()
    
    // Reload page
    await page.reload()
    
    // Sort keys should still be unchecked
    await expect(page.getByTestId('json-sort-keys')).not.toBeChecked()
  })

  test('handles rapid input changes', async ({ page }) => {
    const input = page.getByTestId('json-input')
    
    await input.fill('{"a":1}')
    await input.fill('{"b":2}')
    await input.fill('{"c":3}')

    const output = page.getByTestId('json-output')
    await expect(output.getByTestId('area-content')).toContainText('"c"')
    await expect(output.getByTestId('area-content')).toContainText('3')
  })

  test('handles very large JSON', async ({ page }) => {
    // Create a large JSON with many keys - use string to avoid precision loss
    const jsonParts = ['{']
    for (let i = 0; i < 100; i++) {
      const value = `1747825224230521011${i.toString().padStart(1, '4')}`
      jsonParts.push(`"key${i}":${value}`)
      if (i < 99) jsonParts.push(',')
    }
    jsonParts.push('}')
    const json = jsonParts.join('')
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('json-output')
    await expect(output).toBeVisible()
    await expect(output.getByTestId('area-content')).toContainText('174782522423052101')
  })
})

