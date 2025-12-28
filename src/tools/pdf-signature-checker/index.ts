import { computed } from 'vue';
import { FileCheck } from 'lucide-vue-next'
import { translate } from '@/plugins/i18n.plugin'
import { defineTool } from '../tool'

export const tool = defineTool({
  name: computed(() => translate('tools.pdf-signature-checker.title')),
  path: '/pdf-signature-checker',
  key: 'pdf-signature-checker',
  description: computed(() => translate('tools.pdf-signature-checker.description')),
  keywords: computed(() => translate('tools.pdf-signature-checker.keywords')),
  component: () => import('./pdf-signature-checker.vue'),
  icon: FileCheck,
  createdAt: new Date('2023-12-09'),
});
