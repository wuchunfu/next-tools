import { Router } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.ipv4-subnet-calculator.title')),
  path: '/ipv4-subnet-calculator',
  key: 'ipv4-subnet-calculator',
  description: computed(() => translate('tools.ipv4-subnet-calculator.description')),
  keywords: computed(() => translate('tools.ipv4-subnet-calculator.keywords')),
  component: () => import('./ipv4-subnet-calculator.vue'),
  icon: Router,
})
