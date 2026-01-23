import { CircleGauge } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  key: 'data-transfer-calculator',
  name: computed(() => translate('tools.data-transfer-calculator.title')),
  path: '/data-transfer-calculator',
  description: computed(() => translate('tools.data-transfer-calculator.description')),
  keywords: computed(() => translate('tools.data-transfer-calculator.keywords')),
  component: () => import('./data-transfer-calculator.vue'),
  icon: CircleGauge,
  createdAt: new Date('2026-01-23'),
});