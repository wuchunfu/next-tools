import { AlignJustify } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.yaml-to-toml.title')),
  path: '/yaml-to-toml',
  key: 'yaml-to-toml',
  description: computed(() => translate('tools.yaml-to-toml.description')),
  keywords: computed(() => translate('tools.yaml-to-toml.keywords')),
  component: () => import('./yaml-to-toml.vue'),
  icon: AlignJustify,
  createdAt: new Date('2023-06-23'),
})
