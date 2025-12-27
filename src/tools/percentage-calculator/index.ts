import { Percentage } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.percentage-calculator.title')),
  path: '/percentage-calculator',
  key: 'percentage-calculator',
  description: computed(() => translate('tools.percentage-calculator.description')),
  keywords: computed(() => translate('tools.percentage-calculator.keywords')),
  component: () => import('./percentage-calculator.vue'),
  icon: Percentage,
  createdAt: new Date('2023-06-18'),
})
