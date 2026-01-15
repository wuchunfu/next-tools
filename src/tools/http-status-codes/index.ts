import { Globe } from 'lucide-vue-next'
import { computed } from 'vue'
import { translate } from '@/plugins/i18n.plugin'

import { defineTool } from '../tool'
import { codesByCategories } from './http-status-codes.constants';

const normalizeKey = (value: string) => value.replace(/[^a-z0-9]/gi, '-').toLowerCase();

export const tool = defineTool({
  name: computed(() => translate('tools.http-status-codes.title')),
  path: '/http-status-codes',
  key: 'http-status-codes',
  description: computed(() => translate('tools.http-status-codes.description')),
  keywords: computed(() => {
    const translatedKeywords = translate('tools.http-status-codes.keywords');

    const baseKeywords = translatedKeywords ? translatedKeywords.split(',').map((k: string) => k.trim()) : ['http', 'status', 'codes'];

    const codeKeywords = codesByCategories.flatMap(({ category, codes }) => {
      const translatedCategory = translate(`tools.http-status-codes.categories.${normalizeKey(category)}`);

      return [
        translatedCategory,
        ...codes.flatMap(({ code }) => [
          String(code),
          translate(`tools.http-status-codes.codes.${code}.name`),
        ]),
      ]
    });

    return [...baseKeywords, ...codeKeywords];
  }),
  component: () => import('./http-status-codes.vue'),
  icon: Globe,
  createdAt: new Date('2023-04-13'),
});
