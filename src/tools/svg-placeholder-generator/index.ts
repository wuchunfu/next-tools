import { Image } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.svg-placeholder-generator.title')),
  path: '/svg-placeholder-generator',
  key: 'svg-placeholder-generator',
  description: computed(() => translate('tools.svg-placeholder-generator.description')),
  keywords: computed(() => translate('tools.svg-placeholder-generator.keywords')),
  component: () => import('./svg-placeholder-generator.vue'),
  icon: Image,
})
