import { Type } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.slugify-string.title')),
  path: '/slugify-string',
  key: 'slugify-string',
  description: computed(() => translate('tools.slugify-string.description')),
  keywords: computed(() => translate('tools.slugify-string.keywords')),
  component: () => import('./slugify-string.vue'),
  icon: Type,
})
