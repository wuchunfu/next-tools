import { Link } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.url-encoder.title')),
  path: '/url-encoder',
  key: 'url-encoder',
  description: computed(() => translate('tools.url-encoder.description')),
  keywords: computed(() => translate('tools.url-encoder.keywords')),
  component: () => import('./url-encoder.vue'),
  icon: Link,
})
