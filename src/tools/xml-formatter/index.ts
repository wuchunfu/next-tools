import { Code } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.xml-formatter.title')),
  path: '/xml-formatter',
  key: 'xml-formatter',
  description: computed(() => translate('tools.xml-formatter.description')),
  keywords: computed(() => translate('tools.xml-formatter.keywords')),
  component: () => import('./xml-formatter.vue'),
  icon: Code,
  createdAt: new Date('2023-06-17'),
})
