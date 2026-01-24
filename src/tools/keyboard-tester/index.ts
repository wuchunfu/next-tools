import { Keyboard } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  key: 'keyboard-tester',
  name: computed(() => translate('tools.keyboard-tester.title')),
  path: '/keyboard-tester',
  description: computed(() => translate('tools.keyboard-tester.description')),
  keywords: computed(() => translate('tools.keyboard-tester.keywords')),
  component: () => import('./keyboard-tester.vue'),
  icon: Keyboard,
  createdAt: new Date('2026-01-24'),
});