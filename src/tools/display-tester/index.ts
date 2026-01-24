import { Monitor } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  key: 'display-tester',
  name: computed(() => translate('tools.display-tester.title')),
  path: '/display-tester',
  description: computed(() => translate('tools.display-tester.description')),
  keywords: computed(() => translate('tools.display-tester.keywords')),
  component: () => import('./display-tester.vue'),
  icon: Monitor,
  createdAt: new Date('2026-01-24'),
});