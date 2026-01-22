import { Calculator } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  key: 'date-calculator',
  name: computed(() => translate('tools.date-calculator.title')),
  path: '/date-calculator',
  description: computed(() => translate('tools.date-calculator.description')),
  keywords: computed(() => translate('tools.date-calculator.keywords')),
  component: () => import('./date-calculator.vue'),
  icon: Calculator,
  createdAt: new Date('2026-01-22'),
});