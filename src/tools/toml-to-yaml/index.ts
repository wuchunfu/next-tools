import { computed } from 'vue';
import BracketIcon from '~icons/mdi/code-brackets'
import { translate } from '@/plugins/i18n.plugin'
import { defineTool } from '../tool'

export const tool = defineTool({
  name: computed(() => translate('tools.toml-to-yaml.title')),
  path: '/toml-to-yaml',
  key: 'toml-to-yaml',
  description: computed(() => translate('tools.toml-to-yaml.description')),
  keywords: computed(() => translate('tools.toml-to-yaml.keywords')),
  component: () => import('./toml-to-yaml.vue'),
  icon: BracketIcon,
  createdAt: new Date('2023-06-23'),
});
