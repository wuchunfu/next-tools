import { Lock } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.bcrypt.title')),
  path: '/bcrypt',
  key: 'bcrypt',
  description: computed(() => translate('tools.bcrypt.description')),
  keywords: computed(() => translate('tools.bcrypt.keywords')),
  component: () => import('./bcrypt.vue'),
  icon: Lock,
})
