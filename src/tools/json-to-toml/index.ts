import { Braces } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.json-to-toml.title')),
  path: '/json-to-toml',
  key: 'json-to-toml',
  description: computed(() => translate('tools.json-to-toml.description')),
  keywords: computed(() => translate('tools.json-to-toml.keywords')),
  component: () => import('./json-to-toml.vue'),
  icon: Braces,
  createdAt: new Date('2023-06-23'),
})
