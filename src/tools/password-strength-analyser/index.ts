import { computed } from 'vue';
import { Lock } from 'lucide-vue-next'
import { translate } from '@/plugins/i18n.plugin'
import { defineTool } from '../tool'

export const tool = defineTool({
  name: computed(() => translate('tools.password-strength-analyser.title')),
  path: '/password-strength-analyser',
  key: 'password-strength-analyser',
  description: computed(() => translate('tools.password-strength-analyser.description')),
  keywords: computed(() => translate('tools.password-strength-analyser.keywords')),
  component: () => import('./password-strength-analyser.vue'),
  icon: Lock,
  createdAt: new Date('2023-06-24'),
});
