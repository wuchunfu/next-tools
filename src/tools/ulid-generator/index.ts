import { SortAsc } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.ulid-generator.title')),
  path: '/ulid-generator',
  key: 'ulid-generator',
  description: computed(() => translate('tools.ulid-generator.description')),
  keywords: computed(() => translate('tools.ulid-generator.keywords')),
  component: () => import('./ulid-generator.vue'),
  icon: SortAsc,
  createdAt: new Date('2023-09-11'),
})
