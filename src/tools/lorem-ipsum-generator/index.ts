import { AlignJustify } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.lorem-ipsum-generator.title')),
  path: '/lorem-ipsum-generator',
  key: 'lorem-ipsum-generator',
  description: computed(() => translate('tools.lorem-ipsum-generator.description')),
  keywords: computed(() => translate('tools.lorem-ipsum-generator.keywords')),
  component: () => import('./lorem-ipsum-generator.vue'),
  icon: AlignJustify,
})
