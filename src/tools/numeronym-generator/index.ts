import { CaseSensitive } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin'
import { defineTool } from '../tool'

export const tool = defineTool({
  name: computed(() => translate('tools.numeronym-generator.title')),
  path: '/numeronym-generator',
  key: 'numeronym-generator',
  description: computed(() => translate('tools.numeronym-generator.description')),
  keywords: computed(() => translate('tools.numeronym-generator.keywords')),
  component: () => import('./numeronym-generator.vue'),
  icon: CaseSensitive,
  createdAt: new Date('2023-11-05'),
});
