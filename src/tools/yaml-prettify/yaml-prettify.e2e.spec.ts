import { expect, test } from '@playwright/test'

test.describe('Tool - YAML Prettify', () => {
  test.beforeEach(async ({ page }) => {
    // Set language to English for consistent testing
    await page.addInitScript(() => {
      localStorage.setItem('locale', 'en')
    })
    await page.goto('/yaml-prettify')

  })

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/YAML Prettify/i)
  })

  test('displays input and output sections', async ({ page }) => {
    await expect(page.getByTestId('yaml-input')).toBeVisible()
    await expect(page.getByTestId('yaml-output')).toBeVisible()
  })

  test('formats basic YAML', async ({ page }) => {
    const input = 'hello: world\nfoo: bar'
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('hello: world')
    await expect(output.getByTestId('area-content')).toContainText('foo: bar')
  })

  test('preserves large numbers without precision loss', async ({ page }) => {
    const largeNumber = '17478252242305210114'
    const input = `userId: ${largeNumber}`
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText(largeNumber)
    
    // Should NOT contain the rounded version
    await expect(output.getByTestId('area-content')).not.toContainText('17478252242305210000')
  })

  test('handles nested objects with large numbers', async ({ page }) => {
    const input = `user:
  id: 17478252242305210114
  name: John`
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('name: John')
  })

  test('handles arrays with large numbers', async ({ page }) => {
    const input = `ids:
  - 17478252242305210114
  - 17478252242305210115`
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210115')
  })

  test('handles negative large numbers', async ({ page }) => {
    const input = 'negativeId: -17478252242305210114'
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('-17478252242305210114')
  })

  test('shows error for invalid YAML', async ({ page }) => {
    await page.getByTestId('yaml-input').fill('invalid: yaml: syntax:')

    // Error message should be visible
    await expect(page.getByTestId('error-message')).toBeVisible()
  })

  test('handles empty input', async ({ page }) => {
    await page.getByTestId('yaml-input').fill('')

    // Should not show error for empty input
    await expect(page.getByTestId('error-message')).not.toBeVisible()
  })

  test('handles boolean values', async ({ page }) => {
    const input = 'active: true\ninactive: false'
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('active: true')
    await expect(output.getByTestId('area-content')).toContainText('inactive: false')
  })

  test('handles null values', async ({ page }) => {
    const input = 'value: null'
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('value: null')
  })

  test('handles multiline strings', async ({ page }) => {
    const input = `text: |
  Hello
  World`
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('text:')
  })

  test('handles unicode characters', async ({ page }) => {
    const input = 'emoji: "😀"\nchinese: "你好"'
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('😀')
    await expect(output.getByTestId('area-content')).toContainText('你好')
  })

  test('handles deeply nested structures', async ({ page }) => {
    const input = `level1:
  level2:
    level3:
      value: 17478252242305210114`
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('level1:')
  })

  test('handles mixed types', async ({ page }) => {
    const input = `string: text
number: 42
boolean: true
null: null
array:
  - 1
  - 2
object:
  nested: value`
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('string: text')
    await expect(output.getByTestId('area-content')).toContainText('number: 42')
    await expect(output.getByTestId('area-content')).toContainText('boolean: true')
  })

  test('handles numbers at edge of safe integer range', async ({ page }) => {
    const input = 'safe: 9007199254740991\nunsafe: 9007199254740992'
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740991')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740992')
  })

  test('handles multiple large numbers in nested structure', async ({ page }) => {
    const input = `users:
  - id: 17478252242305210114
    balance: 9007199254740993
  - id: 17478252242305210115
    balance: 9007199254740994`
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210115')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740993')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740994')
  })

  test('handles inline arrays', async ({ page }) => {
    const input = 'items: [1, 2, 3]'
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('items:')
  })

  test('handles inline objects', async ({ page }) => {
    const input = 'user: {id: 1, name: John}'
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('user:')
  })

  test('handles comments', async ({ page }) => {
    const input = '# This is a comment\nhello: world'
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('hello: world')
  })

  test('handles quoted strings', async ({ page }) => {
    const input = 'text: "quoted string"'
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('text:')
  })

  test('handles complex nested arrays', async ({ page }) => {
    const input = `matrix:
  - - 1
    - 2
    - 3
  - - 4
    - 5
    - 6`
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('matrix:')
  })

  test('handles rapid input changes', async ({ page }) => {
    const input = page.getByTestId('yaml-input')
    
    await input.fill('a: 1')
    await input.fill('b: 2')
    await input.fill('c: 3')

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('c: 3')
  })

  test('handles very large YAML', async ({ page }) => {
    // Create a large YAML with many keys - use string template to avoid precision loss
    let largeYaml = ''
    for (let i = 0; i < 100; i++) {
      const value = `1747825224230521011${i.toString().padStart(1, '4')}`
      largeYaml += `key${i}: ${value}\n`
    }
    
    await page.getByTestId('yaml-input').fill(largeYaml)

    const output = page.getByTestId('yaml-output')
    await expect(output).toBeVisible()
    await expect(output.getByTestId('area-content')).toContainText('174782522423052101')
  })

  test('handles floating point numbers', async ({ page }) => {
    const input = 'pi: 3.14159\ne: 2.71828'
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('3.14159')
    await expect(output.getByTestId('area-content')).toContainText('2.71828')
  })

  test('handles empty strings', async ({ page }) => {
    const input = 'empty: ""'
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('empty:')
  })

  test('handles special characters in strings', async ({ page }) => {
    const input = 'text: "Hello\\nWorld"'
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('text:')
  })

  test('handles already formatted YAML', async ({ page }) => {
    const input = `hello: world
foo: bar
nested:
  key: value`
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('hello: world')
    await expect(output.getByTestId('area-content')).toContainText('foo: bar')
  })

  test('handles compact YAML', async ({ page }) => {
    const input = 'hello:world'
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output).toBeVisible()
  })

  test('handles arrays of objects with large numbers', async ({ page }) => {
    const input = `items:
  - id: 17478252242305210114
    name: Item 1
  - id: 17478252242305210115
    name: Item 2`
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210115')
  })

  test('handles objects with numeric keys', async ({ page }) => {
    const input = `123: value1
456: value2`
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output).toBeVisible()
  })

  test('handles date-like strings', async ({ page }) => {
    const input = 'date: "2024-01-01"'
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('date:')
  })

  test('handles anchors and aliases', async ({ page }) => {
    const input = `defaults: &defaults
  adapter: postgres
  host: localhost

development:
  <<: *defaults
  database: dev_db`
    
    await page.getByTestId('yaml-input').fill(input)

    const output = page.getByTestId('yaml-output')
    await expect(output).toBeVisible()
  })
})

