import { Mail } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.email-normalizer.title')),
  path: '/email-normalizer',
  key: 'email-normalizer',
  description: computed(() => translate('tools.email-normalizer.description')),
  keywords: computed(() => translate('tools.email-normalizer.keywords')),
  component: () => import('./email-normalizer.vue'),
  icon: Mail,
  createdAt: new Date('2024-08-15'),
})
