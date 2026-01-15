import { Hourglass } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.eta-calculator.title')),
  path: '/eta-calculator',
  key: 'eta-calculator',
  description: computed(() => translate('tools.eta-calculator.description')),
  keywords: computed(() => translate('tools.eta-calculator.keywords')),
  component: () => import('./eta-calculator.vue'),
  icon: Hourglass,
})
