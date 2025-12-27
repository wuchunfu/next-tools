import { Artboard } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin'
import { defineTool } from '../tool'

export const tool = defineTool({
  key: 'ascii-text-drawer',
  name: computed(() => translate('tools.ascii-text-drawer.title')),
  path: '/ascii-text-drawer',
  description: computed(() => translate('tools.ascii-text-drawer.description')),
  keywords: computed(() => translate('tools.ascii-text-drawer.keywords')),
  component: () => import('./ascii-text-drawer.vue'),
  icon: Artboard,
  createdAt: new Date('2024-03-03'),
})
