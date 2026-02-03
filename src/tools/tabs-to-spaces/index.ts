import { ArrowRightToLine } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.tabs-to-spaces.title')),
  path: '/tabs-to-spaces',
  key: 'tabs-to-spaces',
  description: computed(() => translate('tools.tabs-to-spaces.description')),
  keywords: computed(() => translate('tools.tabs-to-spaces.keywords')),
  component: () => import('./tabs-to-spaces.vue'),
  icon: ArrowRightToLine,
  createdAt: new Date('2024-02-03'),
});
