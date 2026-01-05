#!/usr/bin/env node

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { merge, pick, omit } from 'lodash-es';
import fastGlob from 'fast-glob';
import enquirer from 'enquirer';
import consola from 'consola';
import { Command } from 'commander';
import process from 'node:process';

const currentDirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(currentDirname, '..');
const tempDir = join(rootDir, '.i18n');
const globalLocalesDir = join(rootDir, 'locales');
const toolsDir = join(rootDir, 'src', 'tools');

// Tool base properties that belong to global translations
const TOOL_BASE_PROPERTIES = ['title', 'description', 'keywords'];

// Special choice value for selecting all languages
const ALL_LANGUAGES = '__ALL__';

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
 * Prompt user to select languages
 */
async function selectLanguages(availableLanguages, operation, cliLanguages = null) {
  // If languages specified via CLI
  if (cliLanguages) {
    if (cliLanguages.toLowerCase() === 'all') {
      return availableLanguages;
    }
    const languages = cliLanguages.split(',').map(lang => lang.trim());
    // Validate languages
    const invalidLanguages = languages.filter(lang => !availableLanguages.includes(lang));
    if (invalidLanguages.length > 0) {
      consola.warn(`Invalid languages: ${invalidLanguages.join(', ')}`);
      consola.info(`Available languages: ${availableLanguages.join(', ')}`);
      process.exit(1);
    }
    return languages;
  }

  // Interactive mode
  const choices = [
    { name: ALL_LANGUAGES, message: 'All languages' },
    ...availableLanguages.map(lang => ({ name: lang, message: lang })),
  ];

  const { selectedLanguages } = await enquirer.prompt({
    type: 'multiselect',
    name: 'selectedLanguages',
    message: `Select languages to ${operation}:`,
    choices,
    initial: [0], // Default select "All languages"
  });

  // If "All languages" is selected, return all languages
  if (selectedLanguages.includes(ALL_LANGUAGES)) {
    return availableLanguages;
  }

  return selectedLanguages;
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
    } catch {
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
  } catch {
    // Ignore errors for missing files
  }

  return translations;
}

/**
 * Collect all translations and merge them by language
 */
async function collectTranslations(options = {}) {
  // Check if temp directory exists
  if (existsSync(tempDir)) {
    if (options.yes) {
      consola.info('Auto-confirming: Overwriting existing .i18n directory');
    } else {
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
  }

  const allLanguages = await getLanguages();
  consola.info(`Found ${allLanguages.length} languages: ${allLanguages.join(', ')}`);

  // If -y flag is set without languages specified, default to all languages
  const languagesToProcess = options.yes && !options.languages ? 'all' : options.languages;

  // Let user select languages
  const selectedLanguages = await selectLanguages(allLanguages, 'collect', languagesToProcess);

  if (selectedLanguages.length === 0) {
    consola.warn('No languages selected');
    return;
  }

  consola.start(`Collecting translations for ${selectedLanguages.length} language(s)...`);

  const translationsByLanguage = {};

  // Collect translations for each selected language
  for (const lang of selectedLanguages) {
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
async function createNewLanguage(options = {}) {
  consola.box('Create New Language');

  let lang;

  // Get language code
  if (options.language) {
    lang = options.language.trim();
    // Validate language code
    if (!/^[a-z]{2}(?:_[A-Z]{2})?$/.test(lang)) {
      consola.error('Invalid language code format (e.g., en, zh, pt_BR)');
      process.exit(1);
    }
  } else {
    const { langCode } = await enquirer.prompt({
      type: 'input',
      name: 'langCode',
      message: 'Enter language code (e.g., ja, ko, ar):',
      validate: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Language code is required';
        }
        if (!/^[a-z]{2}(?:_[A-Z]{2})?$/.test(value.trim())) {
          return 'Invalid language code format (e.g., en, zh, pt_BR)';
        }
        return true;
      },
    });
    lang = langCode.trim();
  }

  // Check if language already exists
  const existingLangFile = join(tempDir, `${lang}.json`);
  if (existsSync(existingLangFile)) {
    consola.warn(`Language file already exists: ${existingLangFile}`);

    if (options.yes) {
      consola.info('Auto-confirming: Overwriting existing file');
    } else {
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
  }

  let templateType = options.template || 'empty-template';

  // Ask for template type if not specified
  if (!options.template && !options.yes) {
    const result = await enquirer.prompt({
      type: 'select',
      name: 'templateType',
      message: 'Choose template type:',
      choices: [
        { name: 'empty-template', message: 'Empty template - Based on English structure with empty values (Recommended)' },
        { name: 'empty-file', message: 'Empty file - Just an empty JSON object {}' },
      ],
    });
    templateType = result.templateType;
  }

  // Validate template type
  if (!['empty-template', 'empty-file'].includes(templateType)) {
    consola.error('Invalid template type. Use "empty-template" or "empty-file"');
    process.exit(1);
  }

  let newTranslations = {};

  if (templateType === 'empty-template') {
    // Collect English translations in memory without logging
    const enTranslations = await collectLanguageTranslations('en');

    if (Object.keys(enTranslations).length === 0) {
      consola.error('Could not load English translations');
      return;
    }

    // Create empty template in memory
    newTranslations = createEmptyTemplate(enTranslations);
  } else {
    newTranslations = {};
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
  consola.info(`2. Run 'pnpm run i18n' again and select 'Write back' to apply changes`);
  consola.info(`3. The translations will be distributed to locales/${lang}.json and tool-specific files`);
}

/**
 * Write back translations from temp directory to original files
 */
async function writeBackTranslations(options = {}) {
  // Check if temp directory exists
  if (!existsSync(tempDir)) {
    consola.error(`Temporary directory does not exist: ${tempDir}`);
    consola.info('Please run "Collect translations" first');
    return;
  }

  const tempFiles = await readdir(tempDir);
  const availableLanguages = tempFiles
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''));

  if (availableLanguages.length === 0) {
    consola.warn('No language files found in temporary directory');
    return;
  }

  consola.info(`Found ${availableLanguages.length} languages: ${availableLanguages.join(', ')}`);

  // If -y flag is set without languages specified, default to all languages
  const languagesToProcess = options.yes && !options.languages ? 'all' : options.languages;

  // Let user select languages
  const selectedLanguages = await selectLanguages(availableLanguages, 'write back', languagesToProcess);

  if (selectedLanguages.length === 0) {
    consola.warn('No languages selected');
    return;
  }

  // Confirm operation
  if (options.yes) {
    consola.info(`Auto-confirming: Overwriting existing translation files for ${selectedLanguages.length} language(s)`);
  } else {
    const { confirm } = await enquirer.prompt({
      type: 'confirm',
      name: 'confirm',
      message: `This will overwrite existing translation files for ${selectedLanguages.length} language(s). Continue?`,
      initial: false,
    });

    if (!confirm) {
      consola.info('Operation cancelled');
      return;
    }
  }

  consola.start(`Writing back translations for ${selectedLanguages.length} language(s)...`);

  // Process each selected language
  for (const lang of selectedLanguages) {
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
 * Main function for interactive mode
 */
async function interactiveMode() {
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
    .name('i18n')
    .description('i18n Translation Manager')
    .version('1.0.0');

  // Collect command
  program
    .command('collect')
    .description('Collect translations - Merge all i18n files into temp directory')
    .option('-l, --languages <langs>', 'Specify languages (comma-separated or "all")')
    .option('-y, --yes', 'Auto-confirm prompts (use default values)')
    .action(async (options) => {
      await collectTranslations(options);
    });

  // Write-back command
  program
    .command('write-back')
    .description('Write back translations - Apply changes from temp directory to original files')
    .option('-l, --languages <langs>', 'Specify languages (comma-separated or "all")')
    .option('-y, --yes', 'Auto-confirm prompts (use default values)')
    .action(async (options) => {
      await writeBackTranslations(options);
    });

  // Create command
  program
    .command('create')
    .description('Create new language - Create a new language translation file')
    .option('--language <lang>', 'Specify language code (e.g., ja, ko, ar)')
    .option('-t, --template <type>', 'Template type: "empty-template" or "empty-file"', 'empty-template')
    .option('-y, --yes', 'Auto-confirm prompts (use default values)')
    .action(async (options) => {
      await createNewLanguage(options);
    });

  // Parse arguments
  program.parse();
}

main().catch((error) => {
  consola.error('An error occurred:', error);
  process.exit(1);
});
