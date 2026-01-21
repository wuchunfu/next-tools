import { Braces } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.json-to-yaml.title')),
  path: '/json-to-yaml',
  key: 'json-to-yaml',
  description: computed(() => translate('tools.json-to-yaml.description')),
  keywords: computed(() => translate('tools.json-to-yaml.keywords')),
  component: () => import('./json-to-yaml.vue'),
  icon: Braces,
  createdAt: new Date('2023-04-10'),
})
