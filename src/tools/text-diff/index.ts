import { FileDiff } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.text-diff.title')),
  path: '/text-diff',
  key: 'text-diff',
  description: computed(() => translate('tools.text-diff.description')),
  keywords: computed(() => translate('tools.text-diff.keywords')),
  component: () => import('./text-diff.vue'),
  icon: FileDiff,
  createdAt: new Date('2023-08-16'),
})
