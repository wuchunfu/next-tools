import { List } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.list-converter.title')),
  path: '/list-converter',
  key: 'list-converter',
  description: computed(() => translate('tools.list-converter.description')),
  keywords: computed(() => translate('tools.list-converter.keywords')),
  component: () => import('./list-converter.vue'),
  icon: List,
  createdAt: new Date('2023-05-07'),
})
