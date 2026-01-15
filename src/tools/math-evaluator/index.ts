import { Calculator } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.math-evaluator.title')),
  path: '/math-evaluator',
  key: 'math-evaluator',
  description: computed(() => translate('tools.math-evaluator.description')),
  keywords: computed(() => translate('tools.math-evaluator.keywords')),
  component: () => import('./math-evaluator.vue'),
  icon: Calculator,
})
