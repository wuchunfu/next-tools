import { Language } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.regex-tester.title')),
  path: '/regex-tester',
  key: 'regex-tester',
  description: computed(() => translate('tools.regex-tester.description')),
  keywords: computed(() => translate('tools.regex-tester.keywords')),
  component: () => import('./regex-tester.vue'),
  icon: Language,
  createdAt: new Date('2024-09-20'),
})
