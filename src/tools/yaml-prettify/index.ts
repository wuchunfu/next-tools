import { AlignJustify } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  key: 'yaml-prettify',
  name: computed(() => translate('tools.yaml-prettify.title')),
  path: '/yaml-prettify',
  description: computed(() => translate('tools.yaml-prettify.description')),
  keywords: computed(() => translate('tools.yaml-prettify.keywords')),
  component: () => import('./yaml-prettify.vue'),
  icon: AlignJustify,
  createdAt: new Date('2024-01-31'),
})
