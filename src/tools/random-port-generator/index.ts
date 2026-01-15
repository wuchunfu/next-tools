import { Server } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.random-port-generator.title')),
  path: '/random-port-generator',
  key: 'random-port-generator',
  description: computed(() => translate('tools.random-port-generator.description')),
  keywords: computed(() => translate('tools.random-port-generator.keywords')),
  component: () => import('./random-port-generator.vue'),
  icon: Server,
})
