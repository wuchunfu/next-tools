import { Smartphone } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.mac-address-lookup.title')),
  path: '/mac-address-lookup',
  key: 'mac-address-lookup',
  description: computed(() => translate('tools.mac-address-lookup.description')),
  keywords: computed(() => translate('tools.mac-address-lookup.keywords')),
  component: () => import('./mac-address-lookup.vue'),
  icon: Smartphone,
  createdAt: new Date('2023-04-06'),
})
