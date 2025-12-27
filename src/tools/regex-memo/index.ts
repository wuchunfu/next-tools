import { BrandJavascript } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.regex-memo.title')),
  path: '/regex-memo',
  key: 'regex-memo',
  description: computed(() => translate('tools.regex-memo.description')),
  keywords: computed(() => translate('tools.regex-memo.keywords')),
  component: () => import('./regex-memo.vue'),
  icon: BrandJavascript,
  createdAt: new Date('2024-09-20'),
})
