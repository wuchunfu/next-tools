import { Expand } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.ipv4-range-expander.title')),
  path: '/ipv4-range-expander',
  key: 'ipv4-range-expander',
  description: computed(() => translate('tools.ipv4-range-expander.description')),
  keywords: computed(() => translate('tools.ipv4-range-expander.keywords')),
  component: () => import('./ipv4-range-expander.vue'),
  icon: Expand,
  createdAt: new Date('2023-04-19'),
})
