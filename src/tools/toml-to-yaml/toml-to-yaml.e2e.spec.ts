import { expect, test } from '@playwright/test'

test.describe('Tool - TOML to YAML', () => {
  test.beforeEach(async ({ page }) => {
    // Set language to English for consistent testing
    await page.addInitScript(() => {
      localStorage.setItem('locale', 'en')
    })
    await page.goto('/toml-to-yaml')

  })

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/TOML to YAML/i)
  })

  test('displays input and output sections', async ({ page }) => {
    await expect(page.getByTestId('toml-input')).toBeVisible()
    await expect(page.getByTestId('yaml-output')).toBeVisible()
  })

  test('converts basic TOML to YAML', async ({ page }) => {
    const toml = 'hello = "world"\nfoo = "bar"'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('hello: world')
    await expect(output.getByTestId('area-content')).toContainText('foo: bar')
  })

  test('preserves large numbers without precision loss', async ({ page }) => {
    const largeNumber = '17478252242305210114'
    const toml = `userId = ${largeNumber}`
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText(largeNumber)
    
    // Should NOT contain the rounded version
    await expect(output.getByTestId('area-content')).not.toContainText('17478252242305210000')
  })

  test('converts TOML tables to YAML objects', async ({ page }) => {
    const toml = '[user]\nid = 17478252242305210114\nname = "John"'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('user:')
    await expect(output.getByTestId('area-content')).toContainText('name: John')
  })

  test('converts TOML arrays to YAML arrays', async ({ page }) => {
    const toml = 'ids = [17478252242305210114, 17478252242305210115]'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210115')
    await expect(output.getByTestId('area-content')).toContainText('ids:')
  })

  test('handles negative large numbers', async ({ page }) => {
    const toml = 'negativeId = -17478252242305210114'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('-17478252242305210114')
  })

  test('shows error for invalid TOML', async ({ page }) => {
    await page.getByTestId('toml-input').fill('invalid toml syntax ===')

    // Error message should be visible
    await expect(page.getByTestId('error-message')).toBeVisible()
  })

  test('handles empty input', async ({ page }) => {
    await page.getByTestId('toml-input').fill('')

    // Should not show error for empty input
    await expect(page.getByTestId('error-message')).not.toBeVisible()
  })

  test('converts boolean values', async ({ page }) => {
    const toml = 'active = true\ninactive = false'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('active: true')
    await expect(output.getByTestId('area-content')).toContainText('inactive: false')
  })

  test('handles unicode characters', async ({ page }) => {
    const toml = 'emoji = "😀"\nchinese = "你好"'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('😀')
    await expect(output.getByTestId('area-content')).toContainText('你好')
  })

  test('handles nested TOML tables', async ({ page }) => {
    const toml = '[level1.level2]\nvalue = 17478252242305210114'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('level1:')
  })

  test('handles mixed types', async ({ page }) => {
    const toml = 'string = "text"\nnumber = 42\nboolean = true'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('string: text')
    await expect(output.getByTestId('area-content')).toContainText('number: 42')
    await expect(output.getByTestId('area-content')).toContainText('boolean: true')
  })

  test('handles numbers at edge of safe integer range', async ({ page }) => {
    const toml = 'safe = 9007199254740991\nunsafe = 9007199254740992'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740991')
    await expect(output.getByTestId('area-content')).toContainText('9007199254740992')
  })

  test('handles multiple large numbers in nested structure', async ({ page }) => {
    const toml = '[user1]\nid = 17478252242305210114\n\n[user2]\nid = 17478252242305210115'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210115')
  })

  test('handles floating point numbers', async ({ page }) => {
    const toml = 'pi = 3.14159\ne = 2.71828'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('3.14159')
    await expect(output.getByTestId('area-content')).toContainText('2.71828')
  })

  test('handles arrays of strings', async ({ page }) => {
    const toml = 'tags = ["tag1", "tag2", "tag3"]'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('tags:')
    await expect(output.getByTestId('area-content')).toContainText('- tag1')
  })

  test('handles array of tables', async ({ page }) => {
    const toml = '[[users]]\nname = "John"\n\n[[users]]\nname = "Jane"'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('users:')
    await expect(output.getByTestId('area-content')).toContainText('John')
    await expect(output.getByTestId('area-content')).toContainText('Jane')
  })

  test('handles rapid input changes', async ({ page }) => {
    const input = page.getByTestId('toml-input')
    
    await input.fill('a = 1')
    await input.fill('b = 2')
    await input.fill('c = 3')

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('c: 3')
  })

  test('handles integer values', async ({ page }) => {
    const toml = 'count = 42\ntotal = 100'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('count: 42')
    await expect(output.getByTestId('area-content')).toContainText('total: 100')
  })

  test('handles zero values', async ({ page }) => {
    const toml = 'zero = 0'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('zero: 0')
  })

  test('handles negative numbers', async ({ page }) => {
    const toml = 'negative = -42'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('negative: -42')
  })

  test('handles simple nested table', async ({ page }) => {
    const toml = '[database]\nhost = "localhost"\nport = 5432'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('database:')
    await expect(output.getByTestId('area-content')).toContainText('host: localhost')
    await expect(output.getByTestId('area-content')).toContainText('port: 5432')
  })

  test('handles empty arrays', async ({ page }) => {
    const toml = 'empty = []'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('empty: []')
  })

  test('handles empty strings', async ({ page }) => {
    const toml = 'empty = ""'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('empty:')
  })

  test('handles inline tables', async ({ page }) => {
    const toml = 'user = { name = "John", age = 30 }'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('user:')
    await expect(output.getByTestId('area-content')).toContainText('John')
  })

  test('handles array of tables with large numbers', async ({ page }) => {
    const toml = '[[items]]\nid = 17478252242305210114\nname = "Item 1"\n\n[[items]]\nid = 17478252242305210115\nname = "Item 2"'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210115')
    await expect(output.getByTestId('area-content')).toContainText('Item 1')
  })

  test('produces valid YAML output', async ({ page }) => {
    const toml = '[user]\nid = 17478252242305210114\nname = "John"\nactive = true'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    const outputText = await output.getByTestId('area-content').textContent()
    
    // Should be valid YAML structure
    expect(outputText).toContain(':')
    expect(outputText).toContain('user:')
  })

  test('handles TOML comments', async ({ page }) => {
    const toml = '# This is a comment\nhello = "world"'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('hello: world')
    // Comments should not appear in YAML output
    await expect(output.getByTestId('area-content')).not.toContainText('This is a comment')
  })

  test('handles dotted keys', async ({ page }) => {
    const toml = 'user.name = "John"\nuser.age = 30'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('user:')
    await expect(output.getByTestId('area-content')).toContainText('John')
  })

  test('handles multiline strings', async ({ page }) => {
    const toml = 'text = """\nHello\nWorld\n"""'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('text:')
  })

  test('handles quoted keys', async ({ page }) => {
    const toml = '"quoted key" = "value"'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('quoted key')
    await expect(output.getByTestId('area-content')).toContainText('value')
  })

  test('handles complex nested structure', async ({ page }) => {
    const toml = '[server]\nhost = "localhost"\nport = 8080\n\n[database]\nhost = "db.example.com"\nport = 5432'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('server:')
    await expect(output.getByTestId('area-content')).toContainText('database:')
    await expect(output.getByTestId('area-content')).toContainText('localhost')
    await expect(output.getByTestId('area-content')).toContainText('db.example.com')
  })

  test('handles arrays of numbers', async ({ page }) => {
    const toml = 'numbers = [1, 2, 3, 4, 5]'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('numbers:')
    await expect(output.getByTestId('area-content')).toContainText('- 1')
    await expect(output.getByTestId('area-content')).toContainText('- 5')
  })

  test('handles arrays of booleans', async ({ page }) => {
    const toml = 'flags = [true, false, true]'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('flags:')
    await expect(output.getByTestId('area-content')).toContainText('- true')
    await expect(output.getByTestId('area-content')).toContainText('- false')
  })

  test('handles deeply nested tables', async ({ page }) => {
    const toml = '[a.b.c.d]\nvalue = 17478252242305210114'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('a:')
  })

  test('handles mixed array types', async ({ page }) => {
    const toml = 'mixed = [1, 2.5, "text"]'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('mixed:')
    await expect(output.getByTestId('area-content')).toContainText('- 1')
    await expect(output.getByTestId('area-content')).toContainText('- 2.5')
    await expect(output.getByTestId('area-content')).toContainText('- text')
  })

  test('handles multiple sections with large numbers', async ({ page }) => {
    const toml = '[section1]\nid = 17478252242305210114\n\n[section2]\nid = 17478252242305210115'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('section1:')
    await expect(output.getByTestId('area-content')).toContainText('section2:')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210114')
    await expect(output.getByTestId('area-content')).toContainText('17478252242305210115')
  })

  test('handles very large TOML', async ({ page }) => {
    // Create a large TOML with many keys - use string template to avoid precision loss
    let largeToml = ''
    for (let i = 0; i < 50; i++) {
      const value = `1747825224230521011${i.toString().padStart(1, '4')}`
      largeToml += `key${i} = ${value}\n`
    }
    
    await page.getByTestId('toml-input').fill(largeToml)

    const output = page.getByTestId('yaml-output')
    await expect(output).toBeVisible()
    await expect(output.getByTestId('area-content')).toContainText('174782522423052101')
  })

  test('handles strings with quotes', async ({ page }) => {
    const toml = 'text = "He said \\"hello\\""'
    
    await page.getByTestId('toml-input').fill(toml)

    const output = page.getByTestId('yaml-output')
    await expect(output.getByTestId('area-content')).toContainText('text:')
  })
})

