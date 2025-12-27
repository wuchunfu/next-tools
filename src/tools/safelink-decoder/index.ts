import { Mailbox } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.safelink-decoder.title')),
  path: '/safelink-decoder',
  key: 'safelink-decoder',
  description: computed(() => translate('tools.safelink-decoder.description')),
  keywords: computed(() => translate('tools.safelink-decoder.keywords')),
  component: () => import('./safelink-decoder.vue'),
  icon: Mailbox,
  createdAt: new Date('2024-03-11'),
})
