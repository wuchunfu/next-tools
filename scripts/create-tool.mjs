#!/usr/bin/env node

import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import enquirer from 'enquirer';
import consola from 'consola';
import { Command } from 'commander';

const currentDirname = dirname(fileURLToPath(import.meta.url));

const toolsDir = join(currentDirname, '..', 'src', 'tools');
const localesDir = join(currentDirname, '..', 'locales');

/**
 * Create a new tool with all necessary files
 */
async function createTool(toolName) {
  // Validate tool name
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(toolName)) {
    consola.error('Invalid tool name. Use lowercase with hyphens (e.g., my-tool)');
    process.exit(1);
  }

  consola.box(`Creating tool: ${toolName}`);

  const toolNameCamelCase = toolName.replace(/-./g, (x) => x[1].toUpperCase());
  const toolNameTitleCase = toolName[0].toUpperCase() + toolName.slice(1).replace(/-/g, ' ');
  const toolDir = join(toolsDir, toolName);

  // Create tool directory
  await mkdir(toolDir);
  consola.success(`✓ Directory created: ${toolDir}`);

  // Helper function to create files in the tool directory
  const createToolFile = async (name, content) => {
    const filePath = join(toolDir, name);
    await writeFile(filePath, content.trim());
    consola.success(`✓ File created: ${filePath}`);
  };

  // Create Vue component file
  await createToolFile(
    `${toolName}.vue`,
    `
<template>
  <div>
    Lorem ipsum
  </div>
</template>

<script setup lang="ts">

</script>
`,
  );

  // Create index.ts with i18n support
  await createToolFile(
    `index.ts`,
    `
import { Wrench } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  key: '${toolName}',
  name: computed(() => translate('tools.${toolName}.title')),
  path: '/${toolName}',
  description: computed(() => translate('tools.${toolName}.description')),
  keywords: computed(() => translate('tools.${toolName}.keywords')),
  component: () => import('./${toolName}.vue'),
  icon: Wrench,
  createdAt: new Date('${new Date().toISOString().split('T')[0]}'),
});
`,
  );

  // Create service file
  await createToolFile(`${toolName}.service.ts`, ``);

  // Create test file
  await createToolFile(
    `${toolName}.service.test.ts`,
    `
import { expect, describe, it } from 'vitest';
// import { } from './${toolName}.service';
//
// describe('${toolName}', () => {
//
// })
`,
  );

  // Create e2e test file
  await createToolFile(
    `${toolName}.e2e.spec.ts`,
    `
import { test, expect } from '@playwright/test';

test.describe('Tool - ${toolNameTitleCase}', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/${toolName}');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('${toolNameTitleCase} - Next Tools');
  });

  test('', async ({ page }) => {

  });
});

`,
  );

  // Add import to tools/index.ts
  consola.start('Adding import to tools/index.ts...');
  const toolsIndex = join(toolsDir, 'index.ts');
  const indexContent = await readFile(toolsIndex, { encoding: 'utf-8' }).then((r) => r.split('\n'));

  indexContent.splice(3, 0, `import { tool as ${toolNameCamelCase} } from './${toolName}';`);
  await writeFile(toolsIndex, indexContent.join('\n'));
  consola.success(`✓ Added import in: ${toolsIndex}`);

  // Create locales directory in tool folder
  consola.start('Creating locales directory...');
  const toolLocalesDir = join(toolDir, 'locales');
  await mkdir(toolLocalesDir);
  consola.success(`✓ Created locales directory: ${toolLocalesDir}`);

  // Get all language files
  const languageFiles = await readdir(localesDir);
  const jsonFiles = languageFiles.filter(file => file.endsWith('.json'));

  // Create locale file for each language in tool's locales directory
  consola.start(`Creating locale files for ${jsonFiles.length} languages...`);
  for (const langFile of jsonFiles) {
    const langFilePath = join(toolLocalesDir, langFile);
    const langContent = {
      tools: {
        [toolName]: {}
      }
    };
    await writeFile(langFilePath, JSON.stringify(langContent, null, 2));
  }
  consola.success(`✓ Created ${jsonFiles.length} locale files in tool directory`);

  // Add tool entry to each root locale file
  consola.start('Adding tool entries to root locale files...');
  for (const langFile of jsonFiles) {
    const langFilePath = join(localesDir, langFile);
    const content = await readFile(langFilePath, { encoding: 'utf-8' });
    const jsonContent = JSON.parse(content);

    // Add tool entry under tools section
    if (!jsonContent.tools) {
      jsonContent.tools = {};
    }

    jsonContent.tools[toolName] = {
      title: '',
      description: '',
      keywords: ''
    };

    await writeFile(langFilePath, JSON.stringify(jsonContent, null, 2));
  }
  consola.success(`✓ Added tool entries to ${jsonFiles.length} root locale files`);

  consola.success(`\n✨ Tool '${toolName}' created successfully!`);
  consola.info('\nNext steps:');
  consola.info(`1. Fill in translations in locales/*.json for tools.${toolName}`);
  consola.info(`2. Implement the tool logic in src/tools/${toolName}/${toolName}.vue`);
  consola.info(`3. Add service functions in src/tools/${toolName}/${toolName}.service.ts`);
  consola.info(`4. Write tests in src/tools/${toolName}/${toolName}.service.test.ts`);
}

/**
 * Interactive mode for creating a tool
 */
async function interactiveMode() {
  consola.box('Create New Tool');

  const { toolName } = await enquirer.prompt({
    type: 'input',
    name: 'toolName',
    message: 'Enter tool name (e.g., my-awesome-tool):',
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Tool name is required';
      }
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim())) {
        return 'Invalid tool name. Use lowercase with hyphens (e.g., my-tool)';
      }
      return true;
    },
  });

  await createTool(toolName.trim());
}

/**
 * Main function
 */
async function main() {
  // If no arguments provided, run interactive mode
  if (!process.argv.slice(2).length) {
    await interactiveMode();
    return;
  }

  const program = new Command();

  program
    .name('create-tool')
    .description('Create a new tool with all necessary files and i18n setup')
    .version('1.0.0')
    .argument('[tool-name]', 'Name of the tool to create (e.g., my-tool)')
    .action(async (toolName) => {
      if (toolName) {
        await createTool(toolName);
      } else {
        await interactiveMode();
      }
    });

  // Parse arguments
  program.parse();
}

main().catch((error) => {
  consola.error('An error occurred:', error);
  process.exit(1);
});
