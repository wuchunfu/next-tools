import { X } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.roman-numeral-converter.title')),
  path: '/roman-numeral-converter',
  key: 'roman-numeral-converter',
  description: computed(() => translate('tools.roman-numeral-converter.description')),
  keywords: computed(() => translate('tools.roman-numeral-converter.keywords')),
  component: () => import('./roman-numeral-converter.vue'),
  icon: X,
})
