# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## Version 1.7.0

### Features
-  add ICO generator tool (1ab0ee9)

### Bug fixes
- **sitemap**: exclude redirect routes from sitemap generation (689d542)

### Refactoring
- **ico-generator**: use status enum, add reactive error messages and real-time validation (72523fb)

### Tests
- **ico-generator**: improve e2e test reliability with data-testid (845599b)

### Other
-  Add Product Hunt badge to all README files (6033abe)

### Improve
-  add 200ms delay and fade-in transition to loading placeholder (543e720)

## Version 1.6.5

### Features
-  add loading placeholder to prevent white screen during JS load (7de3f2a)
-  add vite-plugin-sitemap for automatic sitemap and robots.txt generation (ae2018e)

## Version 1.6.4

### Refactoring
-  enhance region detection with multiple geolocation providers (fe42b7d)
-  migrate consent management from composable to Pinia store (b210e35)
-  replace PWA update toast styles with Tailwind CSS classes (8788692)

## Version 1.6.3

### Features
-  add contextual icons to card headers across all tools (6fab0a3)

### Refactoring
-  improve button layout and positioning across generator tools (52f04db)

## Version 1.6.2

### Features
-  add Vercel Speed Insights for performance monitoring (3ec5e4f)
-  add CLI argument support to i18n management tool (d550a60)
-  add unified i18n translation management tool (66beeef)

### Bug fixes
-  replace lodash chain with direct function calls (6f6db84)

### Refactoring
-  enhance release script with interactive CLI support (046dc3e)
-  enhance create-tool script with interactive mode and i18n support (6390e0d)
-  adjust the i18n translation key of tools.categories to categories (a5b7c72)
-  migrate from lodash to lodash-es and adapt scripts for Node.js (1077984)

### Chores
-  add eslint rule to prevent lodash-es chain usage (06f7e61)
-  upgrade eslint config and fix linting issues (fed560c)

### Documentation
-  add development scripts usage to README files (c26b4b9)

### Style
-  hide scrollbar in collapsed sidebar mode (5fd86a7)

## Version 1.6.1

### Features
-  add theme-aware logo support for light and dark modes (3fe2f04)

### Refactoring
-  standardize tool component naming (b6a102d)
-  standardize tool directory and route naming conventions (958d88a)
-  unify copy success message and support reactive language switching (c38af25)

### Documentation
-  update README files across all languages (2b2fa15)

## Version 1.6.0

### Features
-  implement PWA update prompt mechanism to replace auto-update (9fafbcc)

## Version 1.5.3

### Documentation
-  add logo to README files and update locales (5cead98)

### Style
-  adjust About page title styling (7042498)

## Version 1.5.2

### Features
- **consent**: add strict mode and improve privacy by removing location caching (89a9b9e)

### Bug fixes
-  make release script cross-platform compatible (dceb731)

### Documentation
- **changelog**: update changelog for 1.5.2 (29df1b9)
-  add privacy consent management documentation for all languages (e22d9d8)

## Version 1.5.1

### Features
-  Add consent management toggle (fc01024)

## Version 1.5.0

### Features
-  Add comprehensive cookie consent management system (2b75a98)

### Bug fixes
- **build**: Submitting missing information (0cfdf62)
- **build**: Fixing Windows' inability to package (b28aed5)
- **config**: Use to fix missing variables (1e8f438)

## Version 1.4.0

### Features
- **analytics**: add support for Vercel, Google Analytics, and Umami analytics with environment-based configuration (acd3338)

## Version 1.3.4

### Chores
- **icons**: refine icons — adjustments and replacements (1e54d52)

## Version 1.3.3

### Chores
- **icons**: update maskable PWA icons (192x192, 512x512) (bbe9673)

## Version 1.3.2

### Bug fixes
- **command-palette**: prevent default Ctrl/Cmd+K only on platform using useMagicKeys options (87f6d61)

### Chores
-  update changelog and base layout tweaks (4d25997)

## Version 1.3.1

### Chores
- **icons**: update PWA manifest, add maskable and non-maskable desktop icons, and update meta links (a0f474c)

## Version 1.3.0

### Features
-  add figlet fonts for ASCII text generator (a1616bf)
-  update PWA icons and manifest configuration (4a6cf41)

### Bug fixes
-  resolve TypeScript type errors in meta-tag generator (738daaa)

### Refactoring
-  clean up configuration and remove unused settings (e391d31)
-  remove Plausible Analytics integration (bf5916b)
-  remove naive-ui components and dependencies (1ada4ca)

### Chores
-  update build scripts and tooling configuration (f52dd8d)
-  remove unused dependencies (1b8cde5)

### Style
-  migrate components to Tailwind CSS and update styling (462ce04)

## Version 2025.12.28-e50ebc7

### Features
-  bind dev server to 0.0.0.0 for network access (f7fcf72)

### Bug fixes
-  add absolute paths to HTML resource links (e50ebc7)

### Refactoring
-  unify social sharing meta tags in App.vue (38d2131)

## Version 2025.12.28-c200c88

### Features
-  enhance PWA icons and internationalization (c200c88)

## Version 2025.12.28-9a070db

### Features
-  update domain from vercel.app and tech to next-tools.dev (b8599b6)

### Refactoring
-  remove unplugin-icons types from vitest config (9a070db)

## Version 2025.12.28-114c5d5

### Other
-   ()

## Version 2025.12.28-77148e1

### Features
-  add internationalization for command palette features (7cc0710)
-  add tool visit tracking to router navigation guard (214969a)
-  add recent tools feature to command palette (4746a82)

### Refactoring
-  clean up dependencies and build configuration (77148e1)
-  normalize localStorage key naming convention (30490be)
-  migrate from mdi icons to lucide-vue-next (ab472ce)

## [2025.12.28-839e753] - 2025-12-28

### Features
- **PWA Support**: Add PWA icons and update manifest configuration
- **Internationalization**: Internationalize home page title for all 10 supported languages

### Bug fixes
- **Color Picker**: Resolve color picker initialization issues with 8-bit hex colors
- **Tool Locales**: Update tool locales and utilities for consistency

## [Next-Tools] - Fork & Refactor (2024-12-XX)

### Breaking Changes
- **Fork**: This project is now a fork of the original [it-tools](https://github.com/CorentinTh/it-tools) project
- **UI Refactor**: Migrated from Naive UI to [shadcn-vue](https://www.shadcn-vue.com/) component library
- **Architecture**: Updated build system, tooling, and project structure
- **Branding**: Updated all documentation, README files, and project metadata for Next-Tools

### Features
- **UI Modernization**: Complete redesign using shadcn-vue components and Tailwind CSS
- **Performance**: Optimized build system with Vite and improved TypeScript support
- **Internationalization**: Enhanced multi-language support (10 languages)
- **Documentation**: Comprehensive README files in multiple languages

### Refactoring
- **Component Library**: Replaced Naive UI with shadcn-vue
- **Build System**: Updated Vite configuration and tooling
- **Project Structure**: Reorganized file structure and dependencies
- **Scripts**: Updated development and build scripts

### Chores
- **Dependencies**: Updated all project dependencies
- **Licensing**: Maintained GPL-3.0 compliance
- **Documentation**: Updated all documentation and metadata
