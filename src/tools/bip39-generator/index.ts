import { AlignJustified } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.bip39-generator.title')),
  path: '/bip39-generator',
  key: 'bip39-generator',
  description: computed(() => translate('tools.bip39-generator.description')),
  keywords: computed(() => translate('tools.bip39-generator.keywords')),
  component: () => import('./bip39-generator.vue'),
  icon: AlignJustified,
})
