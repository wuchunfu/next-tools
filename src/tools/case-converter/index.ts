import { LetterCaseToggle } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.case-converter.title')),
  path: '/case-converter',
  key: 'case-converter',
  description: computed(() => translate('tools.case-converter.description')),
  keywords: [
    'case',
    'converter',
    'camelCase',
    'capitalCase',
    'constantCase',
    'dotCase',
    'headerCase',
    'noCase',
    'paramCase',
    'pascalCase',
    'pathCase',
    'sentenceCase',
    'snakeCase',
  ],
  component: () => import('./case-converter.vue'),
  icon: LetterCaseToggle,
})
