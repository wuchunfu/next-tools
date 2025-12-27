import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin'
import { defineTool } from '../tool'
import n7mIcon from './n7m-icon.svg?component'

export const tool = defineTool({
  name: computed(() => translate('tools.numeronym-generator.title')),
  path: '/numeronym-generator',
  key: 'numeronym-generator',
  description: computed(() => translate('tools.numeronym-generator.description')),
  keywords: computed(() => translate('tools.numeronym-generator.keywords')),
  component: () => import('./numeronym-generator.vue'),
  icon: n7mIcon,
  createdAt: new Date('2023-11-05'),
});
