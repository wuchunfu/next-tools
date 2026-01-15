import { List } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.json-to-csv.title')),
  path: '/json-to-csv',
  key: 'json-to-csv',
  description: computed(() => translate('tools.json-to-csv.description')),
  keywords: computed(() => translate('tools.json-to-csv.keywords')),
  component: () => import('./json-to-csv.vue'),
  icon: List,
  createdAt: new Date('2023-06-18'),
})
