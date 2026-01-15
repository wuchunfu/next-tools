import { Code } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.html-entities.title')),
  path: '/html-entities',
  key: 'html-entities',
  description: computed(() => translate('tools.html-entities.description')),
  keywords: computed(() => translate('tools.html-entities.keywords')),
  component: () => import('./html-entities.vue'),
  icon: Code,
})
