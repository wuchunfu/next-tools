import { World } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.mime-types.title')),
  path: '/mime-types',
  key: 'mime-types',
  description: computed(() => translate('tools.mime-types.description')),
  keywords: computed(() => translate('tools.mime-types.keywords')),
  component: () => import('./mime-types.vue'),
  icon: World,
})
