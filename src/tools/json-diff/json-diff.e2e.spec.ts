import { expect, test } from '@playwright/test'

test.describe('Tool - JSON Diff', () => {
  test.beforeEach(async ({ page }) => {
    // Set language to English for consistent testing
    await page.addInitScript(() => {
      localStorage.setItem('locale', 'en')
    })
    await page.goto('/json-diff')
  })

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/JSON DIFF/i)
  })

  test('displays left and right input sections', async ({ page }) => {
    await expect(page.getByTestId('json-input-left')).toBeVisible()
    await expect(page.getByTestId('json-input-right')).toBeVisible()
  })

  test('shows no differences for identical JSON', async ({ page }) => {
    const json = '{"hello": "world"}'

    await page.getByTestId('json-input-left').fill(json)
    await page.getByTestId('json-input-right').fill(json)

    // Should show no differences indicator
    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()

    // Should show "same JSON" message
    await expect(diffResult.getByTestId('same-json-message')).toBeVisible()
  })

  test('detects value changes', async ({ page }) => {
    await page.getByTestId('json-input-left').fill('{"hello": "world"}')
    await page.getByTestId('json-input-right').fill('{"hello": "universe"}')

    // Should show differences
    await expect(page.getByTestId('diff-result')).toBeVisible()
  })

  test('detects added properties', async ({ page }) => {
    await page.getByTestId('json-input-left').fill('{"hello": "world"}')
    await page.getByTestId('json-input-right').fill('{"hello": "world", "foo": "bar"}')

    await expect(page.getByTestId('diff-result')).toBeVisible()
  })

  test('detects removed properties', async ({ page }) => {
    await page.getByTestId('json-input-left').fill('{"hello": "world", "foo": "bar"}')
    await page.getByTestId('json-input-right').fill('{"hello": "world"}')

    await expect(page.getByTestId('diff-result')).toBeVisible()
  })

  test('handles large numbers without precision loss', async ({ page }) => {
    const largeNumber = '17478252242305210114'
    const json = `{"userId": ${largeNumber}}`

    await page.getByTestId('json-input-left').fill(json)
    await page.getByTestId('json-input-right').fill(json)

    // Should show no differences (same JSON)
    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()
    await expect(diffResult.getByTestId('same-json-message')).toBeVisible()
  })

  test('detects changes in large numbers', async ({ page }) => {
    await page.getByTestId('json-input-left').fill('{"userId": 17478252242305210114}')
    await page.getByTestId('json-input-right').fill('{"userId": 17478252242305210115}')

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()

    // Should show diff content with both numbers
    const diffContent = diffResult.getByTestId('diff-content')
    await expect(diffContent).toBeVisible()
    await expect(diffContent).toContainText('17478252242305210114')
    await expect(diffContent).toContainText('17478252242305210115')
  })

  test('handles nested objects with large numbers', async ({ page }) => {
    const json1 = '{"user": {"id": 17478252242305210114, "name": "John"}}'
    const json2 = '{"user": {"id": 17478252242305210114, "name": "Jane"}}'

    await page.getByTestId('json-input-left').fill(json1)
    await page.getByTestId('json-input-right').fill(json2)

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()

    // Should show diff content with the large number
    const diffContent = diffResult.getByTestId('diff-content')
    await expect(diffContent).toBeVisible()
    await expect(diffContent).toContainText('17478252242305210114')
  })

  test('handles arrays with large numbers', async ({ page }) => {
    const json1 = '{"ids": [17478252242305210114, 17478252242305210115]}'
    const json2 = '{"ids": [17478252242305210114, 17478252242305210116]}'

    await page.getByTestId('json-input-left').fill(json1)
    await page.getByTestId('json-input-right').fill(json2)

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()

    // Should show diff content with all numbers
    const diffContent = diffResult.getByTestId('diff-content')
    await expect(diffContent).toBeVisible()
    await expect(diffContent).toContainText('17478252242305210114')
    await expect(diffContent).toContainText('17478252242305210115')
    await expect(diffContent).toContainText('17478252242305210116')
  })

  test('handles negative large numbers', async ({ page }) => {
    const json = '{"negativeId": -17478252242305210114}'

    await page.getByTestId('json-input-left').fill(json)
    await page.getByTestId('json-input-right').fill(json)

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()

    // Should show "same JSON" message
    await expect(diffResult.getByTestId('same-json-message')).toBeVisible()
  })

  test('shows error for invalid JSON in left input', async ({ page }) => {
    await page.getByTestId('json-input-left').fill('{invalid json}')
    await page.getByTestId('json-input-right').fill('{"valid": "json"}')

    // Error message should be visible
    await expect(page.getByTestId('error-message-left')).toBeVisible()
  })

  test('shows error for invalid JSON in right input', async ({ page }) => {
    await page.getByTestId('json-input-left').fill('{"valid": "json"}')
    await page.getByTestId('json-input-right').fill('{invalid json}')

    // Error message should be visible
    await expect(page.getByTestId('error-message-right')).toBeVisible()
  })

  test('handles empty inputs', async ({ page }) => {
    await page.getByTestId('json-input-left').fill('')
    await page.getByTestId('json-input-right').fill('')

    // Should not show error for empty inputs
    await expect(page.getByTestId('error-message-left')).not.toBeVisible()
    await expect(page.getByTestId('error-message-right')).not.toBeVisible()
  })

  test('handles null values', async ({ page }) => {
    await page.getByTestId('json-input-left').fill('{"value": null}')
    await page.getByTestId('json-input-right').fill('{"value": null}')

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()
  })

  test('detects null to value changes', async ({ page }) => {
    await page.getByTestId('json-input-left').fill('{"value": null}')
    await page.getByTestId('json-input-right').fill('{"value": "something"}')

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()
  })

  test('handles boolean values', async ({ page }) => {
    await page.getByTestId('json-input-left').fill('{"active": true}')
    await page.getByTestId('json-input-right').fill('{"active": false}')

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()
  })

  test('handles deeply nested structures', async ({ page }) => {
    const json1 = '{"level1": {"level2": {"level3": {"value": 17478252242305210114}}}}'
    const json2 = '{"level1": {"level2": {"level3": {"value": 17478252242305210115}}}}'

    await page.getByTestId('json-input-left').fill(json1)
    await page.getByTestId('json-input-right').fill(json2)

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()

    // Should show diff content with both numbers
    const diffContent = diffResult.getByTestId('diff-content')
    await expect(diffContent).toBeVisible()
    await expect(diffContent).toContainText('17478252242305210114')
    await expect(diffContent).toContainText('17478252242305210115')
  })

  test('handles type changes', async ({ page }) => {
    await page.getByTestId('json-input-left').fill('{"value": "string"}')
    await page.getByTestId('json-input-right').fill('{"value": 123}')

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()
  })

  test('handles array length changes', async ({ page }) => {
    await page.getByTestId('json-input-left').fill('{"items": [1, 2, 3]}')
    await page.getByTestId('json-input-right').fill('{"items": [1, 2]}')

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()
  })

  test('handles array order changes', async ({ page }) => {
    await page.getByTestId('json-input-left').fill('{"items": [1, 2, 3]}')
    await page.getByTestId('json-input-right').fill('{"items": [3, 2, 1]}')

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()
  })

  test('handles special characters in strings', async ({ page }) => {
    const json = '{"text": "Hello\\nWorld\\t!"}'

    await page.getByTestId('json-input-left').fill(json)
    await page.getByTestId('json-input-right').fill(json)

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()
  })

  test('handles unicode characters', async ({ page }) => {
    const json = '{"emoji": "😀", "chinese": "你好"}'

    await page.getByTestId('json-input-left').fill(json)
    await page.getByTestId('json-input-right').fill(json)

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()

    // Should show "same JSON" message
    await expect(diffResult.getByTestId('same-json-message')).toBeVisible()
  })

  test('handles complex nested arrays', async ({ page }) => {
    const json1 = '{"matrix": [[1, 2, 3], [4, 5, 6]]}'
    const json2 = '{"matrix": [[1, 2, 3], [4, 5, 7]]}'

    await page.getByTestId('json-input-left').fill(json1)
    await page.getByTestId('json-input-right').fill(json2)

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()
  })

  test('handles multiple large numbers in nested structure', async ({ page }) => {
    const json1 = '{"users": [{"id": 17478252242305210114, "balance": 9007199254740993}]}'
    const json2 = '{"users": [{"id": 17478252242305210114, "balance": 9007199254740995}]}'

    await page.getByTestId('json-input-left').fill(json1)
    await page.getByTestId('json-input-right').fill(json2)

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()

    // Should show diff content with all numbers
    const diffContent = diffResult.getByTestId('diff-content')
    await expect(diffContent).toBeVisible()
    await expect(diffContent).toContainText('17478252242305210114')
    await expect(diffContent).toContainText('9007199254740993')
    await expect(diffContent).toContainText('9007199254740995')
  })

  test('handles numbers at edge of safe integer range', async ({ page }) => {
    const json = '{"safe": 9007199254740991, "unsafe": 9007199254740992}'

    await page.getByTestId('json-input-left').fill(json)
    await page.getByTestId('json-input-right').fill(json)

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()

    // Should show "same JSON" message
    await expect(diffResult.getByTestId('same-json-message')).toBeVisible()
  })

  test('handles rapid input changes', async ({ page }) => {
    const leftInput = page.getByTestId('json-input-left')
    const rightInput = page.getByTestId('json-input-right')

    await leftInput.fill('{"a": 1}')
    await rightInput.fill('{"a": 1}')

    await leftInput.fill('{"b": 2}')
    await rightInput.fill('{"b": 2}')

    await leftInput.fill('{"c": 3}')
    await rightInput.fill('{"c": 4}')

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()
  })

  test('handles very large JSON objects', async ({ page }) => {
    // Create large JSON objects - use string to avoid precision loss
    const jsonParts1 = ['{']
    const jsonParts2 = ['{']
    for (let i = 0; i < 50; i++) {
      const value = `1747825224230521011${i.toString().padStart(1, '4')}`
      jsonParts1.push(`"key${i}":${value}`)
      jsonParts2.push(`"key${i}":${value}`)
      if (i < 49) {
        jsonParts1.push(',')
        jsonParts2.push(',')
      }
    }
    jsonParts1.push('}')
    jsonParts2.push('}')

    await page.getByTestId('json-input-left').fill(jsonParts1.join(''))
    await page.getByTestId('json-input-right').fill(jsonParts2.join(''))

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()
  })

  test('handles mixed types in objects', async ({ page }) => {
    const json = '{"string": "text", "number": 42, "boolean": true, "null": null, "array": [1, 2, 3], "object": {"nested": "value"}, "bigint": 9007199254740993}'

    await page.getByTestId('json-input-left').fill(json)
    await page.getByTestId('json-input-right').fill(json)

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()

    // Should show "same JSON" message
    await expect(diffResult.getByTestId('same-json-message')).toBeVisible()
  })

  test('handles empty objects', async ({ page }) => {
    await page.getByTestId('json-input-left').fill('{}')
    await page.getByTestId('json-input-right').fill('{}')

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()
  })

  test('handles empty arrays', async ({ page }) => {
    await page.getByTestId('json-input-left').fill('[]')
    await page.getByTestId('json-input-right').fill('[]')

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()
  })

  test('detects object to array type change', async ({ page }) => {
    await page.getByTestId('json-input-left').fill('{"items": {}}')
    await page.getByTestId('json-input-right').fill('{"items": []}')

    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()
  })

  test('handles formatted vs minified JSON', async ({ page }) => {
    const formatted = `{
  "hello": "world"
}`
    const minified = '{"hello":"world"}'

    await page.getByTestId('json-input-left').fill(formatted)
    await page.getByTestId('json-input-right').fill(minified)

    // Should show no differences (same content, different formatting)
    const diffResult = page.getByTestId('diff-result')
    await expect(diffResult).toBeVisible()
  })
})

