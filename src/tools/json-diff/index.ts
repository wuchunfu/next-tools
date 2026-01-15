import { ArrowLeftRight } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.json-diff.title')),
  path: '/json-diff',
  key: 'json-diff',
  description: computed(() => translate('tools.json-diff.description')),
  keywords: computed(() => translate('tools.json-diff.keywords')),
  component: () => import('./json-diff.vue'),
  icon: ArrowLeftRight,
  createdAt: new Date('2023-04-20'),
})
