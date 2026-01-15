import { Lock } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.encryption.title')),
  path: '/encryption',
  key: 'encryption',
  description: computed(() => translate('tools.encryption.description')),
  keywords: computed(() => translate('tools.encryption.keywords')),
  component: () => import('./encryption.vue'),
  icon: Lock,
  redirectFrom: ['/cypher'],
})
