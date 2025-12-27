import { Palette } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.color-converter.title')),
  path: '/color-converter',
  key: 'color-converter',
  description: computed(() => translate('tools.color-converter.description')),
  keywords: computed(() => translate('tools.color-converter.keywords')),
  component: () => import('./color-converter.vue'),
  icon: Palette,
  redirectFrom: ['/color-picker-converter'],
})
