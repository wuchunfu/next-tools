import { Braces } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.xml-to-json.title')),
  path: '/xml-to-json',
  key: 'xml-to-json',
  description: computed(() => translate('tools.xml-to-json.description')),
  keywords: computed(() => translate('tools.xml-to-json.keywords')),
  component: () => import('./xml-to-json.vue'),
  icon: Braces,
  createdAt: new Date('2024-08-09'),
})
