import { FileText } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  key: 'base64-file-converter',
  name: computed(() => translate('tools.base64-file-converter.title')),
  path: '/base64-file-converter',
  description: computed(() => translate('tools.base64-file-converter.description')),
  keywords: computed(() => translate('tools.base64-file-converter.keywords')),
  component: () => import('./base64-file-converter.vue'),
  icon: FileText,
})
