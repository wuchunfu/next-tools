import { AlarmClockCheck } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.cron-generator.title')),
  path: '/cron-generator',
  key: 'cron-generator',
  description: computed(() => translate('tools.cron-generator.description')),
  keywords: computed(() => translate('tools.cron-generator.keywords')),
  component: () => import('./cron-generator.vue'),
  icon: AlarmClockCheck,
  createdAt: new Date('2026-01-15'),
})
