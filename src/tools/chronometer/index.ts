import { Timer } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.chronometer.title')),
  path: '/chronometer',
  key: 'chronometer',
  description: computed(() => translate('tools.chronometer.description')),
  keywords: computed(() => translate('tools.chronometer.keywords')),
  component: () => import('./chronometer.vue'),
  icon: Timer,
})
