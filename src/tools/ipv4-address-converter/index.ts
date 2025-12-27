import { Binary } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.ipv4-address-converter.title')),
  path: '/ipv4-address-converter',
  key: 'ipv4-address-converter',
  description: computed(() => translate('tools.ipv4-address-converter.description')),
  keywords: computed(() => translate('tools.ipv4-address-converter.keywords')),
  component: () => import('./ipv4-address-converter.vue'),
  icon: Binary,
  createdAt: new Date('2023-04-08'),
})
