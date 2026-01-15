import { Smartphone } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.mac-address-generator.title')),
  path: '/mac-address-generator',
  key: 'mac-address-generator',
  description: computed(() => translate('tools.mac-address-generator.description')),
  keywords: computed(() => translate('tools.mac-address-generator.keywords')),
  component: () => import('./mac-address-generator.vue'),
  icon: Smartphone,
  createdAt: new Date('2023-11-31'),
})
