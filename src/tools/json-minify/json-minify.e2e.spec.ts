import { expect, test } from '@playwright/test'

test.describe('Tool - JSON Minify', () => {
  test.beforeEach(async ({ page }) => {
    // Set language to English for consistent testing
    await page.addInitScript(() => {
      localStorage.setItem('locale', 'en')
    })
    await page.goto('/json-minify')

  })

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/JSON Minify/i)
  })

  test('displays input and output sections', async ({ page }) => {
    await expect(page.getByTestId('json-input')).toBeVisible()
  })

  test('has default formatted JSON in input', async ({ page }) => {
    const input = page.getByTestId('json-input')
    const value = await input.inputValue()
    
    // Should have default value
    expect(value).toContain('"hello"')
    expect(value).toContain('"world"')
  })

  test('minifies formatted JSON', async ({ page }) => {
    const formattedJson = `{
  "hello": "world",
  "foo": "bar"
}`
    
    await page.getByTestId('json-input').fill(formattedJson)

    const output = page.getByTestId('json-output')
    const outputText = await output.getByTestId('area-content').textContent()
    
    // Should be minified (no newlines or extra spaces)
    expect(outputText).toBe('{"hello":"world","foo":"bar"}')
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
    const json = `{
  "userId": ${largeNumber}
}`
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('json-output')
    await expect(output.getByTestId('area-content')).toContainText(largeNumber)
    
    // Should NOT contain the rounded version
    await expect(output.getByTestId('area-content')).not.toContainText('17478252242305210000')
  })

  test('handles nested objects with large numbers', async ({ page }) => {
    const json = `{
  "user": {
    "id": 17478252242305210114,
    "name": "John"
  }
}`
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('json-output')
    const outputText = await output.getByTestId('area-content').textContent()
    
    expect(outputText).toContain('17478252242305210114')
    expect(outputText).toContain('"name":"John"')
    expect(outputText).not.toContain('\n')
  })

  test('handles arrays with large numbers', async ({ page }) => {
    const json = `{
  "ids": [
    17478252242305210114,
    17478252242305210115
  ]
}`
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('json-output')
    const outputText = await output.getByTestId('area-content').textContent()
    
    expect(outputText).toContain('17478252242305210114')
    expect(outputText).toContain('17478252242305210115')
    expect(outputText).not.toContain('\n')
  })

  test('handles negative large numbers', async ({ page }) => {
    const json = `{
  "negativeId": -17478252242305210114
}`
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('json-output')
    await expect(output.getByTestId('area-content')).toContainText('-17478252242305210114')
  })

  test('handles special characters in strings', async ({ page }) => {
    const json = '{"text": "Hello\\nWorld\\t!"}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('json-output')
    await expect(output.getByTestId('area-content')).toContainText('Hello\\nWorld\\t!')
  })

  test('handles unicode characters', async ({ page }) => {
    const json = '{"emoji": "😀", "chinese": "你好"}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('json-output')
    await expect(output.getByTestId('area-content')).toContainText('😀')
    await expect(output.getByTestId('area-content')).toContainText('你好')
  })

  test('handles boolean and null values', async ({ page }) => {
    const json = `{
  "active": true,
  "inactive": false,
  "empty": null
}`
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('json-output')
    const outputText = await output.getByTestId('area-content').textContent()
    
    expect(outputText).toContain('true')
    expect(outputText).toContain('false')
    expect(outputText).toContain('null')
  })

  test('handles empty object', async ({ page }) => {
    await page.getByTestId('json-input').fill('{}')

    const output = page.getByTestId('json-output')
    const outputText = await output.getByTestId('area-content').textContent()
    
    expect(outputText).toBe('{}')
  })

  test('handles empty array', async ({ page }) => {
    await page.getByTestId('json-input').fill('[]')

    const output = page.getByTestId('json-output')
    const outputText = await output.getByTestId('area-content').textContent()
    
    expect(outputText).toBe('[]')
  })

  test('handles deeply nested structures', async ({ page }) => {
    const json = `{
  "level1": {
    "level2": {
      "level3": {
        "value": 17478252242305210114
      }
    }
  }
}`
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('json-output')
    const outputText = await output.getByTestId('area-content').textContent()
    
    expect(outputText).toContain('17478252242305210114')
    expect(outputText).not.toContain('\n')
    expect(outputText).toContain('"level1":{"level2":{"level3":{"value":17478252242305210114}}}')
  })

  test('handles complex structure with multiple large numbers', async ({ page }) => {
    const json = `{
  "users": [
    {
      "id": 17478252242305210114,
      "balance": 9007199254740993
    },
    {
      "id": 17478252242305210115,
      "balance": 9007199254740994
    }
  ]
}`
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('json-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210115')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740993')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740994')
  })

  test('removes all whitespace', async ({ page }) => {
    const json = `{
  "a"  :  1  ,
  "b"  :  2
}`
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('json-output')
    const outputText = await output.getByTestId('area-content').textContent()
    
    expect(outputText).toBe('{"a":1,"b":2}')
  })

  test('handles already minified JSON', async ({ page }) => {
    const json = '{"hello":"world","foo":"bar"}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('json-output')
    const outputText = await output.getByTestId('area-content').textContent()
    
    expect(outputText).toBe(json)
  })

  test('handles rapid input changes', async ({ page }) => {
    const input = page.getByTestId('json-input')
    
    await input.fill('{"a":1}')
    await input.fill('{"b":2}')
    await input.fill('{"c":3}')

    const output = page.getByTestId('json-output')
    const outputText = await output.getByTestId('area-content').textContent()
    
    expect(outputText).toBe('{"c":3}')
  })

  test('handles very large JSON', async ({ page }) => {
    // Create a large JSON with many keys - use string to avoid precision loss
    const jsonParts = ['{\n']
    for (let i = 0; i < 100; i++) {
      const value = `1747825224230521011${i.toString().padStart(1, '4')}`
      jsonParts.push(`  "key${i}": ${value}`)
      if (i < 99) jsonParts.push(',\n')
    }
    jsonParts.push('\n}')
    const json = jsonParts.join('')
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('json-output')
    await expect(output).toBeVisible()
    await expect(output.getByTestId('area-content')).toContainText('174782522423052101')
  })

  test('handles mixed types in object', async ({ page }) => {
    const json = `{
  "string": "text",
  "number": 42,
  "boolean": true,
  "null": null,
  "array": [1, 2, 3],
  "object": {"nested": "value"},
  "bigint": 9007199254740993
}`
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('json-output')
    const outputText = await output.getByTestId('area-content').textContent()
    
    expect(outputText).not.toContain('\n')
    expect(outputText).toContain('"string":"text"')
    expect(outputText).toContain('"number":42')
    expect(outputText).toContain('"boolean":true')
    expect(outputText).toContain('"null":null')
    expect(outputText).toContain('9007199254740993')
  })

  test('handles numbers at edge of safe integer range', async ({ page }) => {
    const json = `{
  "safe": 9007199254740991,
  "unsafe": 9007199254740992
}`
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('json-output')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740991')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740992')
  })
})

