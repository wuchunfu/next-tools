import { AlignJustify } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.yaml-to-json.title')),
  path: '/yaml-to-json',
  key: 'yaml-to-json',
  description: computed(() => translate('tools.yaml-to-json.description')),
  keywords: computed(() => translate('tools.yaml-to-json.keywords')),
  component: () => import('./yaml-to-json.vue'),
  icon: AlignJustify,
  createdAt: new Date('2023-04-10'),
})
