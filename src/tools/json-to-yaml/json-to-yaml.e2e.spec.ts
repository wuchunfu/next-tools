import { expect, test } from '@playwright/test'

test.describe('Tool - JSON to YAML', () => {
  test.beforeEach(async ({ page }) => {
    // Set language to English for consistent testing
    await page.addInitScript(() => {
      localStorage.setItem('locale', 'en')
    })
    await page.goto('/json-to-yaml')

  })

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/JSON to YAML/i)
  })

  test('displays input and output sections', async ({ page }) => {
    await expect(page.getByTestId('json-input')).toBeVisible()
    await expect(page.getByTestId('yaml-output')).toBeVisible()
  })

  test('converts basic JSON to YAML', async ({ page }) => {
    const json = '{"hello": "world", "foo": "bar"}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('hello: world')
    await expect(output.getByTestId('area-content')).toContainText('foo: bar')
  })

  test('preserves large numbers without precision loss', async ({ page }) => {
    const largeNumber = '17478252242305210114'
    const json = `{"userId": ${largeNumber}}`
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText(largeNumber)
    
    // Should NOT contain the rounded version
    await expect(output.getByTestId('area-content')).not.toContainText('17478252242305210000')
  })

  test('converts nested JSON objects to YAML', async ({ page }) => {
    const json = '{"user": {"id": 17478252242305210114, "name": "John"}}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('name: John')
    await expect(output.getByTestId('area-content')).toContainText('user:')
  })

  test('converts JSON arrays to YAML arrays', async ({ page }) => {
    const json = '{"ids": [17478252242305210114, 17478252242305210115]}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210115')
    await expect(output.getByTestId('area-content')).toContainText('ids:')
  })

  test('handles negative large numbers', async ({ page }) => {
    const json = '{"negativeId": -17478252242305210114}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('-17478252242305210114')
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

  test('converts boolean values', async ({ page }) => {
    const json = '{"active": true, "inactive": false}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('active: true')
    await expect(output.getByTestId('area-content')).toContainText('inactive: false')
  })

  test('converts null values', async ({ page }) => {
    const json = '{"value": null}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('value: null')
  })

  test('handles unicode characters', async ({ page }) => {
    const json = '{"emoji": "😀", "chinese": "你好"}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('😀')
    await expect(output.getByTestId('area-content')).toContainText('你好')
  })

  test('handles deeply nested structures', async ({ page }) => {
    const json = '{"level1": {"level2": {"level3": {"value": 17478252242305210114}}}}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('level1:')
  })

  test('handles mixed types', async ({ page }) => {
    const json = '{"string": "text", "number": 42, "boolean": true, "null": null, "array": [1, 2], "object": {"nested": "value"}}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('string: text')
    await expect(output.getByTestId('area-content')).toContainText('number: 42')
    await expect(output.getByTestId('area-content')).toContainText('boolean: true')
  })

  test('handles numbers at edge of safe integer range', async ({ page }) => {
    const json = '{"safe": 9007199254740991, "unsafe": 9007199254740992}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740991')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740992')
  })

  test('handles multiple large numbers in nested structure', async ({ page }) => {
    const json = '{"users": [{"id": 17478252242305210114, "balance": 9007199254740993}, {"id": 17478252242305210115, "balance": 9007199254740994}]}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210115')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740993')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740994')
  })

  test('handles empty JSON object', async ({ page }) => {
    await page.getByTestId('json-input').fill('{}')

    const output = page.getByTestId('yaml-output')
    await expect(output).toBeVisible()
  })

  test('handles empty JSON array', async ({ page }) => {
    await page.getByTestId('json-input').fill('[]')

    const output = page.getByTestId('yaml-output')
    await expect(output).toBeVisible()
  })

  test('handles floating point numbers', async ({ page }) => {
    const json = '{"pi": 3.14159, "e": 2.71828}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('3.14159')
    await expect(output.getByTestId('area-content')).toContainText('2.71828')
  })

  test('handles complex nested arrays', async ({ page }) => {
    const json = '{"matrix": [[1, 2, 3], [4, 5, 6]]}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('matrix:')
  })

  test('handles rapid input changes', async ({ page }) => {
    const input = page.getByTestId('json-input')
    
    await input.fill('{"a": 1}')
    await input.fill('{"b": 2}')
    await input.fill('{"c": 3}')

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('c: 3')
  })

  test('handles very large JSON', async ({ page }) => {
    // Create a large JSON with many keys - use string to avoid precision loss
    const jsonParts = ['{']
    for (let i = 0; i < 100; i++) {
      const value = `1747825224230521011${i.toString().padStart(1, '4')}`
      jsonParts.push(`"key${i}": ${value}`)
      if (i < 99) jsonParts.push(',')
    }
    jsonParts.push('}')
    const json = jsonParts.join('')
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output).toBeVisible()
    await expect(output.getByTestId('area-content')).toContainText('174782522423052101')
  })

  test('handles arrays of objects with large numbers', async ({ page }) => {
    const json = '{"items": [{"id": 17478252242305210114, "name": "Item 1"}, {"id": 17478252242305210115, "name": "Item 2"}]}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210115')
    await expect(output.getByTestId('area-content')).toContainText('Item 1')
  })

  test('handles empty strings', async ({ page }) => {
    const json = '{"empty": ""}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('empty:')
  })

  test('handles special characters in strings', async ({ page }) => {
    const json = '{"text": "Hello\\nWorld\\t!"}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('text:')
  })

  test('handles arrays of strings', async ({ page }) => {
    const json = '{"tags": ["tag1", "tag2", "tag3"]}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('tags:')
    await expect(output.getByTestId('area-content')).toContainText('- tag1')
  })

  test('handles arrays of mixed types', async ({ page }) => {
    const json = '{"mixed": [1, "text", true, null]}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('mixed:')
    await expect(output.getByTestId('area-content')).toContainText('- 1')
    await expect(output.getByTestId('area-content')).toContainText('- text')
  })

  test('produces valid YAML output', async ({ page }) => {
    const json = '{"user": {"id": 17478252242305210114, "name": "John", "active": true}}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    const outputText = await output.getByTestId('area-content').textContent()
    
    // Should be valid YAML structure
    expect(outputText).toContain(':')
    expect(outputText).toContain('user:')
  })

  test('handles formatted JSON input', async ({ page }) => {
    const json = `{
  "hello": "world",
  "foo": "bar"
}`
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('hello: world')
    await expect(output.getByTestId('area-content')).toContainText('foo: bar')
  })

  test('handles minified JSON input', async ({ page }) => {
    const json = '{"hello":"world","foo":"bar"}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('hello: world')
    await expect(output.getByTestId('area-content')).toContainText('foo: bar')
  })

  test('handles strings with quotes', async ({ page }) => {
    const json = '{"text": "He said \\"hello\\""}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('text:')
  })

  test('handles nested arrays of objects', async ({ page }) => {
    const json = '{"data": [[{"a": 1}], [{"b": 2}]]}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('data:')
  })
})

