import { Browser } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.user-agent-parser.title')),
  path: '/user-agent-parser',
  key: 'user-agent-parser',
  description: computed(() => translate('tools.user-agent-parser.description')),
  keywords: computed(() => translate('tools.user-agent-parser.keywords')),
  component: () => import('./user-agent-parser.vue'),
  icon: Browser,
  createdAt: new Date('2023-04-06'),
})
