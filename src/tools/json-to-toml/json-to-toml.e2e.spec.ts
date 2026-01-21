import { expect, test } from '@playwright/test'

test.describe('Tool - JSON to TOML', () => {
  test.beforeEach(async ({ page }) => {
    // Set language to English for consistent testing
    await page.addInitScript(() => {
      localStorage.setItem('locale', 'en')
    })
    await page.goto('/json-to-toml')

  })

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/JSON to TOML/i)
  })

  test('displays input and output sections', async ({ page }) => {
    await expect(page.getByTestId('json-input')).toBeVisible()
    await expect(page.getByTestId('toml-output')).toBeVisible()
  })

  test('converts basic JSON to TOML', async ({ page }) => {
    const json = '{"hello": "world", "foo": "bar"}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('hello = "world"')
    await expect(output.getByTestId('area-content')).toContainText('foo = "bar"')
  })

  test('preserves large numbers without precision loss', async ({ page }) => {
    const largeNumber = '17478252242305210114'
    const json = `{"userId": ${largeNumber}}`
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText(largeNumber)
    
    // Should NOT contain the rounded version
    await expect(output.getByTestId('area-content')).not.toContainText('17478252242305210000')
  })

  test('converts nested JSON objects to TOML tables', async ({ page }) => {
    const json = '{"user": {"id": 17478252242305210114, "name": "John"}}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('[user]')
    await expect(output.getByTestId('area-content')).toContainText('name = "John"')
  })

  test('converts JSON arrays to TOML arrays', async ({ page }) => {
    const json = '{"ids": [17478252242305210114, 17478252242305210115]}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210115')
  })

  test('handles negative large numbers', async ({ page }) => {
    const json = '{"negativeId": -17478252242305210114}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
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

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('active = true')
    await expect(output.getByTestId('area-content')).toContainText('inactive = false')
  })

  test('handles unicode characters', async ({ page }) => {
    const json = '{"emoji": "😀", "chinese": "你好"}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('😀')
    await expect(output.getByTestId('area-content')).toContainText('你好')
  })

  test('handles deeply nested structures', async ({ page }) => {
    const json = '{"level1": {"level2": {"value": 17478252242305210114}}}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
  })

  test('handles mixed types', async ({ page }) => {
    const json = '{"string": "text", "number": 42, "boolean": true}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('string = "text"')
    await expect(output.getByTestId('area-content')).toContainText('number = 42')
    await expect(output.getByTestId('area-content')).toContainText('boolean = true')
  })

  test('handles numbers at edge of safe integer range', async ({ page }) => {
    const json = '{"safe": 9007199254740991, "unsafe": 9007199254740992}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740991')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740992')
  })

  test('handles multiple large numbers in nested structure', async ({ page }) => {
    const json = '{"user1": {"id": 17478252242305210114}, "user2": {"id": 17478252242305210115}}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210115')
  })

  test('handles floating point numbers', async ({ page }) => {
    const json = '{"pi": 3.14159, "e": 2.71828}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('3.14159')
    await expect(output.getByTestId('area-content')).toContainText('2.71828')
  })

  test('handles arrays of strings', async ({ page }) => {
    const json = '{"tags": ["tag1", "tag2", "tag3"]}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('tags =')
    await expect(output.getByTestId('area-content')).toContainText('tag1')
  })

  test('handles arrays of objects', async ({ page }) => {
    const json = '{"users": [{"name": "John"}, {"name": "Jane"}]}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('John')
    await expect(output.getByTestId('area-content')).toContainText('Jane')
  })

  test('handles rapid input changes', async ({ page }) => {
    const input = page.getByTestId('json-input')
    
    await input.fill('{"a": 1}')
    await input.fill('{"b": 2}')
    await input.fill('{"c": 3}')

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('c = 3')
  })

  test('handles arrays with large numbers and objects', async ({ page }) => {
    const json = '{"items": [{"id": 17478252242305210114, "name": "Item 1"}, {"id": 17478252242305210115, "name": "Item 2"}]}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210115')
  })

  test('handles empty strings', async ({ page }) => {
    const json = '{"empty": ""}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('empty = ""')
  })

  test('handles integer values', async ({ page }) => {
    const json = '{"count": 42, "total": 100}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('count = 42')
    await expect(output.getByTestId('area-content')).toContainText('total = 100')
  })

  test('handles zero values', async ({ page }) => {
    const json = '{"zero": 0}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('zero = 0')
  })

  test('handles negative numbers', async ({ page }) => {
    const json = '{"negative": -42}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('negative = -42')
  })

  test('handles simple nested object', async ({ page }) => {
    const json = '{"database": {"host": "localhost", "port": 5432}}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('[database]')
    await expect(output.getByTestId('area-content')).toContainText('host = "localhost"')
    await expect(output.getByTestId('area-content')).toContainText('port = 5432')
  })

  test('handles empty arrays', async ({ page }) => {
    const json = '{"empty": []}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('empty = []')
  })

  test('produces valid TOML output', async ({ page }) => {
    const json = '{"user": {"id": 17478252242305210114, "name": "John", "active": true}}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    const outputText = await output.getByTestId('area-content').textContent()
    
    // Should be valid TOML structure
    expect(outputText).toContain('=')
    expect(outputText).toContain('[user]')
  })

  test('handles formatted JSON input', async ({ page }) => {
    const json = `{
  "hello": "world",
  "foo": "bar"
}`
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('hello = "world"')
    await expect(output.getByTestId('area-content')).toContainText('foo = "bar"')
  })

  test('handles minified JSON input', async ({ page }) => {
    const json = '{"hello":"world","foo":"bar"}'
    
    await page.getByTestId('json-input').fill(json)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('hello = "world"')
    await expect(output.getByTestId('area-content')).toContainText('foo = "bar"')
  })
})

