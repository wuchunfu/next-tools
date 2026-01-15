import { FileText } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.text-statistics.title')),
  path: '/text-statistics',
  key: 'text-statistics',
  description: computed(() => translate('tools.text-statistics.description')),
  keywords: computed(() => translate('tools.text-statistics.keywords')),
  component: () => import('./text-statistics.vue'),
  icon: FileText,
  redirectFrom: ['/text-stats'],
})
