import { Fingerprint } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.uuid-generator.title')),
  path: '/uuid-generator',
  key: 'uuid-generator',
  description: computed(() => translate('tools.uuid-generator.description')),
  keywords: computed(() => translate('tools.uuid-generator.keywords')),
  component: () => import('./uuid-generator.vue'),
  icon: Fingerprint,
})
