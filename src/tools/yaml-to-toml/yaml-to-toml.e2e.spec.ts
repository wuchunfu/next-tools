import { expect, test } from '@playwright/test'

test.describe('Tool - YAML to TOML', () => {
  test.beforeEach(async ({ page }) => {
    // Set language to English for consistent testing
    await page.addInitScript(() => {
      localStorage.setItem('locale', 'en')
    })
    await page.goto('/yaml-to-toml')

  })

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/YAML to TOML/i)
  })

  test('displays input and output sections', async ({ page }) => {
    await expect(page.getByTestId('yaml-input')).toBeVisible()
    await expect(page.getByTestId('toml-output')).toBeVisible()
  })

  test('converts basic YAML to TOML', async ({ page }) => {
    const yaml = 'hello: world\nfoo: bar'
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('hello = "world"')
    await expect(output.getByTestId('area-content')).toContainText('foo = "bar"')
  })

  test('preserves large numbers without precision loss', async ({ page }) => {
    const largeNumber = '17478252242305210114'
    const yaml = `userId: ${largeNumber}`
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText(largeNumber)
    
    // Should NOT contain the rounded version
    await expect(output.getByTestId('area-content')).not.toContainText('17478252242305210000')
  })

  test('converts nested YAML objects to TOML tables', async ({ page }) => {
    const yaml = `user:
  id: 17478252242305210114
  name: John`
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('[user]')
    await expect(output.getByTestId('area-content')).toContainText('name = "John"')
  })

  test('converts YAML arrays to TOML arrays', async ({ page }) => {
    const yaml = `ids:
  - 17478252242305210114
  - 17478252242305210115`
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210115')
  })

  test('handles negative large numbers', async ({ page }) => {
    const yaml = 'negativeId: -17478252242305210114'
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
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

  test('converts boolean values', async ({ page }) => {
    const yaml = 'active: true\ninactive: false'
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('active = true')
    await expect(output.getByTestId('area-content')).toContainText('inactive = false')
  })

  test('handles unicode characters', async ({ page }) => {
    const yaml = 'emoji: "😀"\nchinese: "你好"'
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('😀')
    await expect(output.getByTestId('area-content')).toContainText('你好')
  })

  test('handles deeply nested structures', async ({ page }) => {
    const yaml = `level1:
  level2:
    value: 17478252242305210114`
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
  })

  test('handles mixed types', async ({ page }) => {
    const yaml = `string: text
number: 42
boolean: true`
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('string = "text"')
    await expect(output.getByTestId('area-content')).toContainText('number = 42')
    await expect(output.getByTestId('area-content')).toContainText('boolean = true')
  })

  test('handles numbers at edge of safe integer range', async ({ page }) => {
    const yaml = 'safe: 9007199254740991\nunsafe: 9007199254740992'
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740991')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740992')
  })

  test('handles multiple large numbers in nested structure', async ({ page }) => {
    const yaml = `user1:
  id: 17478252242305210114
user2:
  id: 17478252242305210115`
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210115')
  })

  test('handles floating point numbers', async ({ page }) => {
    const yaml = 'pi: 3.14159\ne: 2.71828'
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('3.14159')
    await expect(output.getByTestId('area-content')).toContainText('2.71828')
  })

  test('handles arrays of strings', async ({ page }) => {
    const yaml = `tags:
  - tag1
  - tag2
  - tag3`
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('tags =')
    await expect(output.getByTestId('area-content')).toContainText('tag1')
  })

  test('handles arrays of objects', async ({ page }) => {
    const yaml = `users:
  - name: John
  - name: Jane`
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('John')
    await expect(output.getByTestId('area-content')).toContainText('Jane')
  })

  test('handles rapid input changes', async ({ page }) => {
    const input = page.getByTestId('yaml-input')
    
    await input.fill('a: 1')
    await input.fill('b: 2')
    await input.fill('c: 3')

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('c = 3')
  })

  test('handles arrays with large numbers and objects', async ({ page }) => {
    const yaml = `items:
  - id: 17478252242305210114
    name: Item 1
  - id: 17478252242305210115
    name: Item 2`
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210115')
  })

  test('handles empty strings', async ({ page }) => {
    const yaml = 'empty: ""'
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('empty = ""')
  })

  test('handles integer values', async ({ page }) => {
    const yaml = 'count: 42\ntotal: 100'
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('count = 42')
    await expect(output.getByTestId('area-content')).toContainText('total = 100')
  })

  test('handles zero values', async ({ page }) => {
    const yaml = 'zero: 0'
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('zero = 0')
  })

  test('handles negative numbers', async ({ page }) => {
    const yaml = 'negative: -42'
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('negative = -42')
  })

  test('handles simple nested object', async ({ page }) => {
    const yaml = `database:
  host: localhost
  port: 5432`
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('[database]')
    await expect(output.getByTestId('area-content')).toContainText('host = "localhost"')
    await expect(output.getByTestId('area-content')).toContainText('port = 5432')
  })

  test('handles empty arrays', async ({ page }) => {
    const yaml = 'empty: []'
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('empty = []')
  })

  test('handles inline YAML arrays', async ({ page }) => {
    const yaml = 'items: [1, 2, 3]'
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('items = [ 1, 2, 3 ]')
  })

  test('handles inline YAML objects', async ({ page }) => {
    const yaml = 'user: {name: John, age: 30}'
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('[user]')
    await expect(output.getByTestId('area-content')).toContainText('John')
  })

  test('handles multiline strings', async ({ page }) => {
    const yaml = `text: |
  Hello
  World`
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('text =')
  })

  test('handles quoted strings', async ({ page }) => {
    const yaml = 'text: "quoted string"'
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('text = "quoted string"')
  })

  test('produces valid TOML output', async ({ page }) => {
    const yaml = `user:
  id: 17478252242305210114
  name: John
  active: true`
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    const outputText = await output.getByTestId('area-content').textContent()
    
    // Should be valid TOML structure
    expect(outputText).toContain('=')
    expect(outputText).toContain('[user]')
  })

  test('handles YAML comments', async ({ page }) => {
    const yaml = `# This is a comment
hello: world`
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('hello = "world"')
    // Comments should not appear in TOML output
    await expect(output.getByTestId('area-content')).not.toContainText('This is a comment')
  })

  test('handles deeply nested objects with large numbers', async ({ page }) => {
    const yaml = `level1:
  level2:
    level3:
      id: 17478252242305210114
      balance: 9007199254740993`
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740993')
  })

  test('handles very large YAML', async ({ page }) => {
    // Create a large YAML with many keys - use string template to avoid precision loss
    let largeYaml = ''
    for (let i = 0; i < 50; i++) {
      const value = `1747825224230521011${i.toString().padStart(1, '4')}`
      largeYaml += `key${i}: ${value}\n`
    }
    
    await page.getByTestId('yaml-input').fill(largeYaml)

    const output = page.getByTestId('toml-output')
    await expect(output).toBeVisible()
    await expect(output.getByTestId('area-content')).toContainText('174782522423052101')
  })

  test('handles single quoted strings', async ({ page }) => {
    const yaml = "text: 'single quoted'"
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('text =')
    await expect(output.getByTestId('area-content')).toContainText('single quoted')
  })

  test('handles special characters in strings', async ({ page }) => {
    const yaml = 'text: "Hello\\nWorld"'
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('text =')
  })

  test('handles complex structure with multiple sections', async ({ page }) => {
    const yaml = `server:
  host: localhost
  port: 8080

database:
  host: db.example.com
  port: 5432
  name: mydb`
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('[server]')
    await expect(output.getByTestId('area-content')).toContainText('[database]')
    await expect(output.getByTestId('area-content')).toContainText('localhost')
    await expect(output.getByTestId('area-content')).toContainText('db.example.com')
  })

  test('handles arrays of numbers', async ({ page }) => {
    const yaml = 'numbers: [1, 2, 3, 4, 5]'
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('numbers = [ 1, 2, 3, 4, 5 ]')
  })

  test('handles arrays of booleans', async ({ page }) => {
    const yaml = 'flags: [true, false, true]'
    
    await page.getByTestId('yaml-input').fill(yaml)

    const output = page.getByTestId('toml-output')
    await expect(output.getByTestId('area-content')).toContainText('flags =')
    await expect(output.getByTestId('area-content')).toContainText('true')
    await expect(output.getByTestId('area-content')).toContainText('false')
  })
})

