import { Shield } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.rsa-key-pair-generator.title')),
  path: '/rsa-key-pair-generator',
  key: 'rsa-key-pair-generator',
  description: computed(() => translate('tools.rsa-key-pair-generator.description')),
  keywords: computed(() => translate('tools.rsa-key-pair-generator.keywords')),
  component: () => import('./rsa-key-pair-generator.vue'),
  icon: Shield,
})
