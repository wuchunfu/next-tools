import { Unlink } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.url-parser.title')),
  path: '/url-parser',
  key: 'url-parser',
  description: computed(() => translate('tools.url-parser.description')),
  keywords: computed(() => translate('tools.url-parser.keywords')),
  component: () => import('./url-parser.vue'),
  icon: Unlink,
})
