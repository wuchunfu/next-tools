import { FileDigit } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.base64-string-converter.title')),
  path: '/base64-string-converter',
  key: 'base64-string-converter',
  description: computed(() => translate('tools.base64-string-converter.description')),
  keywords: computed(() => translate('tools.base64-string-converter.keywords')),
  component: () => import('./base64-string-converter.vue'),
  icon: FileDigit,
  redirectFrom: ['/file-to-base64', '/base64-converter'],
})
