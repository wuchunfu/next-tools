import { Braces } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.json-minify.title')),
  path: '/json-minify',
  key: 'json-minify',
  description: computed(() => translate('tools.json-minify.description')),
  keywords: computed(() => translate('tools.json-minify.keywords')),
  component: () => import('./json-minify.vue'),
  icon: Braces,
})
