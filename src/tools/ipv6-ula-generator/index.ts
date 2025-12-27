import { BuildingFactory } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.ipv6-ula-generator.title')),
  path: '/ipv6-ula-generator',
  key: 'ipv6-ula-generator',
  description: computed(() => translate('tools.ipv6-ula-generator.description')),
  keywords: computed(() => translate('tools.ipv6-ula-generator.keywords')),
  component: () => import('./ipv6-ula-generator.vue'),
  icon: BuildingFactory,
  createdAt: new Date('2023-04-09'),
})
