#!/usr/bin/env node

import { $ } from 'zx';
import { consola } from 'consola';
import semver from 'semver';
import { Command } from 'commander';
import enquirer from 'enquirer';
import process from 'node:process';
import { rawCommitsToMarkdown } from './shared/commits.mjs';
import { addToChangelog } from './shared/changelog.mjs';
import packageData from '../package.json' with { type: 'json' };

$.verbose = false;

/**
 * Get commit history since last tag
 */
async function getCommitHistory() {
  let rawCommits;

  try {
    // Get the latest tag first, then use it in git log
    const tagResult = await $`git describe --tags --abbrev=0`;
    const latestTag = tagResult.stdout.trim();
    const result = await $`git log --pretty=oneline ${latestTag}..HEAD`;
    rawCommits = result.stdout;
  } catch {
    // If no previous tag found, check if there are any commits at all
    try {
      const result = await $`git log --pretty=oneline --oneline -1`;
      rawCommits = result.stdout;
    } catch {
      rawCommits = '';
    }
  }

  // Filter out empty lines and invalid commit lines
  const validCommits = rawCommits
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.match(/^[a-f0-9]{7,}/)) // Must start with commit hash
    .join('\n');

  return validCommits;
}

/**
 * Perform the release process
 */
async function performRelease(options = {}) {
  const currentVersion = packageData.version;
  const isDryRun = options.dryRun || false;
  const isYes = options.yes || false;

  consola.info(`Current version: ${currentVersion}`);

  // Get commit history
  const validCommits = await getCommitHistory();

  if (!validCommits) {
    consola.error('No new commits found since last release');
    consola.info('Please make some commits before running release');
    process.exit(1);
  }

  const markdown = rawCommitsToMarkdown({ rawCommits: validCommits });

  consola.info(`Changelog: \n\n${markdown}\n\n`);

  if (isDryRun) {
    consola.info(`[dry-run] Auto-confirm: ${isYes ? 'enabled' : 'disabled'}`);
    consola.info(`[dry-run] Not creating version nor tag`);
    consola.info('Aborting');
    process.exit(0);
  }

  // Version bump type selection
  let bumpType = options.bump;

  if (!bumpType) {
    // Interactive prompt for bump type
    const { selectedBumpType } = await enquirer.prompt({
      type: 'select',
      name: 'selectedBumpType',
      message: 'Select version bump type:',
      choices: [
        { name: 'patch', message: 'Patch (1.0.0 → 1.0.1) - Bug fixes' },
        { name: 'minor', message: 'Minor (1.0.0 → 1.1.0) - New features' },
        { name: 'major', message: 'Major (1.0.0 → 2.0.0) - Breaking changes' },
      ],
    });
    bumpType = selectedBumpType;
  } else {
    consola.info(`Using bump type from arguments: ${bumpType}`);
  }

  // Validate bumpType
  const validTypes = ['patch', 'minor', 'major'];
  if (!validTypes.includes(bumpType)) {
    consola.error(`Invalid bump type: ${bumpType}. Must be one of: ${validTypes.join(', ')}`);
    process.exit(1);
  }

  // Calculate new version
  const newVersion = semver.inc(currentVersion, bumpType);

  if (!newVersion) {
    consola.error(`Failed to increment version ${currentVersion} with type ${bumpType}`);
    process.exit(1);
  }

  consola.info(`Bump type: ${bumpType}`);
  consola.info(`New version will be: ${newVersion}`);

  // Confirmation prompt
  if (!isYes) {
    const { shouldContinue } = await enquirer.prompt({
      type: 'confirm',
      name: 'shouldContinue',
      message: `This will create version ${newVersion} and update the changelog. Continue?`,
      initial: true,
    });

    if (!shouldContinue) {
      consola.info('Aborting');
      process.exit(0);
    }
  } else {
    consola.info('Auto-confirm enabled, proceeding with release...');
  }

  // Update changelog
  consola.info('Updating changelog');
  await addToChangelog({ changelog: markdown, version: newVersion });
  consola.success('Changelog updated');

  try {
    consola.info('Committing changelog changes');
    await $`git add CHANGELOG.md`;
    await $`git commit -m "docs(changelog): update changelog for ${newVersion}"`;
    consola.success('Changelog changes committed');

    consola.info('Creating version and tag');
    await $`npm version ${newVersion} -m "chore(version): release ${newVersion}"`;
    consola.info(`Version ${newVersion} released with tag v${newVersion}`);
  } catch (err) {
    consola.error(err);
    consola.info('Aborting');
    process.exit(1);
  }
}

/**
 * Interactive mode entry point
 */
async function interactiveMode() {
  consola.box('Release Manager');

  const currentVersion = packageData.version;
  consola.info(`Current version: ${currentVersion}\n`);

  // Check for commits
  const validCommits = await getCommitHistory();

  if (!validCommits) {
    consola.error('No new commits found since last release');
    consola.info('Please make some commits before running release');
    process.exit(1);
  }

  const markdown = rawCommitsToMarkdown({ rawCommits: validCommits });
  consola.info(`Changelog preview:\n\n${markdown}\n`);

  // Ask for bump type
  const { bumpType } = await enquirer.prompt({
    type: 'select',
    name: 'bumpType',
    message: 'Select version bump type:',
    choices: [
      { name: 'patch', message: 'Patch (1.0.0 → 1.0.1) - Bug fixes' },
      { name: 'minor', message: 'Minor (1.0.0 → 1.1.0) - New features' },
      { name: 'major', message: 'Major (1.0.0 → 2.0.0) - Breaking changes' },
    ],
  });

  const newVersion = semver.inc(currentVersion, bumpType);

  if (!newVersion) {
    consola.error(`Failed to increment version ${currentVersion} with type ${bumpType}`);
    process.exit(1);
  }

  consola.info(`\nNew version will be: ${newVersion}`);

  // Final confirmation
  const { confirm } = await enquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message: `This will create version ${newVersion} and update the changelog. Continue?`,
    initial: true,
  });

  if (!confirm) {
    consola.info('Operation cancelled');
    process.exit(0);
  }

  // Perform release
  await performRelease({ bump: bumpType, yes: true });
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
    .name('release')
    .description('Release Manager - Create new version and update changelog')
    .version(packageData.version);

  // Default command (no subcommands, just options)
  program
    .option('-b, --bump <type>', 'Version bump type: patch, minor, or major')
    .option('-y, --yes', 'Auto-confirm all prompts')
    .option('--dry-run', 'Run without creating version or tag')
    .action(async (options) => {
      await performRelease(options);
    });

  // Parse arguments
  program.parse();
}

main().catch((error) => {
  consola.error('An error occurred:', error);
  process.exit(1);
});
