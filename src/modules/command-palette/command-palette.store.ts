import { chain, take } from 'lodash'
import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'
import BugIcon from '~icons/mdi/bug-outline'
import GithubIcon from '~icons/mdi/github'

import InfoIcon from '~icons/mdi/information-outline'
import SunIcon from '~icons/mdi/white-balance-sunny'
import { useFuzzySearch } from '@/composable/fuzzySearch'
import { useStyleStore } from '@/stores/style.store'
import { useToolStore } from '@/tools/tools.store'

export const useCommandPaletteStore = defineStore('command-palette', () => {
  const { t } = useI18n();
  const toolStore = useToolStore();
  const styleStore = useStyleStore();
  const _router = useRouter();
  const searchPrompt = ref('');

  const searchOptions = computed(() => {
    const toolsOptions = toolStore.tools.map(tool => ({
      ...tool,
      keywords: toValue(tool.keywords),
      name: toValue(tool.name),
      description: toValue(tool.description),
      to: tool.path,
      toolCategory: tool.category,
      category: 'Tools',
    }));

    return [
      ...toolsOptions,
      {
        name: t('commandPalette.actions.toggleDarkMode'),
        description: t('commandPalette.actions.toggleDarkModeDescription'),
        action: () => styleStore.toggleDark(),
        icon: SunIcon,
        category: t('commandPalette.categories.actions'),
        keywords: t('commandPalette.keywords.toggleDarkMode'),
      },
      {
        name: t('commandPalette.external.githubRepository'),
        href: 'https://github.com/willjayyyy/next-tools',
        category: t('commandPalette.categories.external'),
        description: t('commandPalette.external.githubRepositoryDescription'),
        keywords: t('commandPalette.keywords.githubRepository'),
        icon: GithubIcon,
      },
      {
        name: t('commandPalette.actions.reportBug'),
        description: t('commandPalette.actions.reportBugDescription'),
        href: 'https://github.com/willjayyyy/next-tools/issues/new/choose',
        category: t('commandPalette.categories.actions'),
        keywords: t('commandPalette.keywords.reportBug'),
        icon: BugIcon,
      },
      {
        name: t('commandPalette.pages.about'),
        description: t('commandPalette.pages.aboutDescription'),
        to: '/about',
        category: t('commandPalette.categories.pages'),
        keywords: t('commandPalette.keywords.about'),
        icon: InfoIcon,
      },
    ];
  })

  const { searchResult } = useFuzzySearch({
    search: searchPrompt,
    data: searchOptions,
    options: {
      keys: [{ name: 'name', weight: 2 }, 'description', 'keywords', 'category'],
      threshold: 0.3,
      filterEmpty: false,
    },
  });

  const filteredSearchResult = computed(() =>
    chain(searchResult.value).groupBy('category').mapValues(categoryOptions => take(categoryOptions, 5)).value());

  return {
    filteredSearchResult,
    searchOptions,
    searchPrompt,
  };
})
