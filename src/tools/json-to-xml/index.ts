import { Braces } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.json-to-xml.title')),
  path: '/json-to-xml',
  key: 'json-to-xml',
  description: computed(() => translate('tools.json-to-xml.description')),
  keywords: computed(() => translate('tools.json-to-xml.keywords')),
  component: () => import('./json-to-xml.vue'),
  icon: Braces,
  createdAt: new Date('2024-08-09'),
})
