import { computed } from 'vue';
import BracketIcon from '~icons/mdi/code-brackets'
import { translate } from '@/plugins/i18n.plugin'

import { defineTool } from '../tool'

export const tool = defineTool({
  name: computed(() => translate('tools.toml-to-json.title')),
  path: '/toml-to-json',
  key: 'toml-to-json',
  description: computed(() => translate('tools.toml-to-json.description')),
  keywords: computed(() => translate('tools.toml-to-json.keywords')),
  component: () => import('./toml-to-json.vue'),
  icon: BracketIcon,
  createdAt: new Date('2023-06-23'),
});
