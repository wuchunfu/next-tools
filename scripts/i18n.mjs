#!/usr/bin/env node

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { merge, pick, omit } from 'lodash-es';
import fastGlob from 'fast-glob';
import enquirer from 'enquirer';
import consola from 'consola';

const currentDirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(currentDirname, '..');
const tempDir = join(rootDir, '.i18n');
const globalLocalesDir = join(rootDir, 'locales');
const toolsDir = join(rootDir, 'src', 'tools');

// Tool base properties that belong to global translations
const TOOL_BASE_PROPERTIES = ['title', 'description', 'keywords'];

/**
 * Get all available language codes
 */
async function getLanguages() {
  const globalLocaleFiles = await readdir(globalLocalesDir);
  return globalLocaleFiles
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''));
}

/**
 * Collect translations for a specific language
 */
async function collectLanguageTranslations(lang) {
  const translations = {};

  // 1. Load all tool translations first
  const toolLocaleFiles = await fastGlob(`src/tools/**/locales/${lang}.json`, {
    cwd: rootDir,
    absolute: true,
  });

  for (const toolFilePath of toolLocaleFiles) {
    try {
      const toolContent = await readFile(toolFilePath, 'utf-8');
      const toolTranslations = JSON.parse(toolContent);
      Object.assign(translations, merge({}, translations, toolTranslations));
    } catch (error) {
      // Ignore errors for missing files
    }
  }

  // 2. Load global translations
  const globalFilePath = join(globalLocalesDir, `${lang}.json`);
  try {
    const globalContent = await readFile(globalFilePath, 'utf-8');
    const globalTranslations = JSON.parse(globalContent);

    // Merge global translations
    Object.assign(translations, merge({}, translations, globalTranslations));

    // Explicitly ensure tool base properties use global values
    if (globalTranslations.tools && translations.tools) {
      for (const [toolName, toolGlobalData] of Object.entries(globalTranslations.tools)) {
        if (translations.tools[toolName]) {
          for (const baseProp of TOOL_BASE_PROPERTIES) {
            if (toolGlobalData[baseProp] !== undefined) {
              translations.tools[toolName][baseProp] = toolGlobalData[baseProp];
            }
          }
        }
      }
    }
  } catch (error) {
    // Ignore errors for missing files
  }

  return translations;
}

/**
 * Collect all translations and merge them by language
 */
async function collectTranslations() {
  // Check if temp directory exists
  if (existsSync(tempDir)) {
    const { confirm } = await enquirer.prompt({
      type: 'confirm',
      name: 'confirm',
      message: 'Temporary directory .i18n already exists. Overwrite?',
      initial: false,
    });

    if (!confirm) {
      consola.info('Operation cancelled');
      return;
    }
  }

  consola.start('Collecting translation files...');

  const languages = await getLanguages();
  consola.info(`Found ${languages.length} languages: ${languages.join(', ')}`);

  const translationsByLanguage = {};

  // Collect translations for each language
  for (const lang of languages) {
    consola.start(`Collecting translations for ${lang}...`);
    translationsByLanguage[lang] = await collectLanguageTranslations(lang);
    consola.success(`✓ Collected translations for ${lang}`);
  }

  // Create temp directory
  await mkdir(tempDir, { recursive: true });

  // Write merged translation files
  for (const [lang, translations] of Object.entries(translationsByLanguage)) {
    const outputPath = join(tempDir, `${lang}.json`);
    await writeFile(outputPath, JSON.stringify(translations, null, 2), 'utf-8');
    consola.success(`✓ Saved ${lang}.json`);
  }

  consola.success(`\nAll translations collected to: ${tempDir}`);
  consola.info(`\nYou can now edit translation files in .i18n directory`);
  consola.info(`After editing, run the script again and select 'Write back' to apply changes`);
}

/**
 * Create empty template based on a reference language
 */
function createEmptyTemplate(referenceTranslations) {
  function makeEmpty(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = makeEmpty(value);
      } else {
        result[key] = '';
      }
    }
    return result;
  }

  return makeEmpty(referenceTranslations);
}

/**
 * Create a new language file
 */
async function createNewLanguage() {
  consola.box('Create New Language');

  // Ask for language code
  const { langCode } = await enquirer.prompt({
    type: 'input',
    name: 'langCode',
    message: 'Enter language code (e.g., ja, ko, ar):',
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Language code is required';
      }
      if (!/^[a-z]{2}(_[A-Z]{2})?$/.test(value.trim())) {
        return 'Invalid language code format (e.g., en, zh, pt_BR)';
      }
      return true;
    },
  });

  const lang = langCode.trim();

  // Check if language already exists
  const existingLangFile = join(tempDir, `${lang}.json`);
  if (existsSync(existingLangFile)) {
    consola.warn(`Language file already exists: ${existingLangFile}`);
    const { overwrite } = await enquirer.prompt({
      type: 'confirm',
      name: 'overwrite',
      message: 'Overwrite existing file?',
      initial: false,
    });

    if (!overwrite) {
      consola.info('Operation cancelled');
      return;
    }
  }

  // Ask for template type
  const { templateType } = await enquirer.prompt({
    type: 'select',
    name: 'templateType',
    message: 'Choose template type:',
    choices: [
      { name: 'empty-template', message: 'Empty template - Based on English structure with empty values (Recommended)' },
      { name: 'empty-file', message: 'Empty file - Just an empty JSON object {}' },
    ],
  });

  let newTranslations = {};

  if (templateType === 'empty-template') {
    consola.start('Collecting English translations as template...');

    // Collect English translations
    const enTranslations = await collectLanguageTranslations('en');

    if (Object.keys(enTranslations).length === 0) {
      consola.error('Could not load English translations');
      return;
    }

    // Create empty template
    newTranslations = createEmptyTemplate(enTranslations);
    consola.success('Empty template created based on English structure');
  } else {
    newTranslations = {};
    consola.success('Empty file created');
  }

  // Create temp directory if it doesn't exist
  if (!existsSync(tempDir)) {
    await mkdir(tempDir, { recursive: true });
  }

  // Write new language file
  const outputPath = join(tempDir, `${lang}.json`);
  await writeFile(outputPath, JSON.stringify(newTranslations, null, 2), 'utf-8');

  consola.success(`\n✓ New language file created: ${outputPath}`);
  consola.info(`\nNext steps:`);
  consola.info(`1. Edit the translation file in .i18n/${lang}.json`);
  consola.info(`2. Run 'npm run i18n' again and select 'Write back' to apply changes`);
  consola.info(`3. The translations will be distributed to locales/${lang}.json and tool-specific files`);
}

/**
 * Write back translations from temp directory to original files
 */
async function writeBackTranslations() {
  // Check if temp directory exists
  if (!existsSync(tempDir)) {
    consola.error(`Temporary directory does not exist: ${tempDir}`);
    consola.info('Please run "Collect translations" first');
    return;
  }

  // Confirm operation
  const { confirm } = await enquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message: 'This will overwrite existing translation files. Continue?',
    initial: false,
  });

  if (!confirm) {
    consola.info('Operation cancelled');
    return;
  }

  consola.start('Writing back translation files...');

  const tempFiles = await readdir(tempDir);
  const languages = tempFiles
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''));

  consola.info(`Found ${languages.length} languages: ${languages.join(', ')}`);

  // Process each language
  for (const lang of languages) {
    consola.start(`Processing translations for ${lang}...`);

    // Read temp translation file
    const tempFilePath = join(tempDir, `${lang}.json`);
    const tempContent = await readFile(tempFilePath, 'utf-8');
    const translations = JSON.parse(tempContent);

    // Prepare global translations (all public keys + tools with only base properties)
    const globalTranslations = { ...translations };

    // Process tools if exists
    if (translations.tools) {
      // For global file: keep only base properties for each tool
      globalTranslations.tools = {};

      for (const [toolName, toolData] of Object.entries(translations.tools)) {
        const baseProperties = pick(toolData, TOOL_BASE_PROPERTIES);
        if (Object.keys(baseProperties).length > 0) {
          globalTranslations.tools[toolName] = baseProperties;
        }

        // For tool-specific file: exclude base properties, keep only tool-specific translations
        const toolSpecificTranslations = omit(toolData, TOOL_BASE_PROPERTIES);

        // Only write tool file if there are tool-specific translations
        if (Object.keys(toolSpecificTranslations).length > 0) {
          const toolDir = join(toolsDir, toolName);
          const toolLocalesDir = join(toolDir, 'locales');

          if (existsSync(toolDir) && existsSync(toolLocalesDir)) {
            const toolFilePath = join(toolLocalesDir, `${lang}.json`);
            const toolFileContent = {
              tools: {
                [toolName]: toolSpecificTranslations,
              },
            };

            await writeFile(
              toolFilePath,
              JSON.stringify(toolFileContent, null, 2),
              'utf-8'
            );
            consola.success(`  ✓ Updated ${toolName}/locales/${lang}.json`);
          } else {
            consola.warn(`  ⚠ Tool directory or locales directory does not exist: ${toolName}`);
          }
        }
      }
    }

    // Write global translation file
    const globalFilePath = join(globalLocalesDir, `${lang}.json`);
    await writeFile(
      globalFilePath,
      JSON.stringify(globalTranslations, null, 2),
      'utf-8'
    );
    consola.success(`✓ Updated global translation for ${lang}`);
  }

  consola.success(`\nAll translation files have been successfully written back!`);
  consola.info('\nSuggestion: Use git diff to review changes and ensure translations are correct');
}

/**
 * Main function
 */
async function main() {
  consola.box('i18n Translation Manager');

  const { action } = await enquirer.prompt({
    type: 'select',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      { name: 'collect', message: 'Collect translations - Merge all i18n files into temp directory' },
      { name: 'writeBack', message: 'Write back translations - Apply changes from temp directory to original files' },
      { name: 'createNew', message: 'Create new language - Create a new language translation file' },
    ],
  });

  if (action === 'collect') {
    await collectTranslations();
  } else if (action === 'writeBack') {
    await writeBackTranslations();
  } else if (action === 'createNew') {
    await createNewLanguage();
  }
}

main().catch((error) => {
  consola.error('An error occurred:', error);
  process.exit(1);
});
