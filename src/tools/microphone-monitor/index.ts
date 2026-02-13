import { Mic } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  key: 'microphone-monitor',
  name: computed(() => translate('tools.microphone-monitor.title')),
  path: '/microphone-monitor',
  description: computed(() => translate('tools.microphone-monitor.description')),
  keywords: computed(() => translate('tools.microphone-monitor.keywords')),
  component: () => import('./microphone-monitor.vue'),
  icon: Mic,
  createdAt: new Date('2026-02-13'),
});
