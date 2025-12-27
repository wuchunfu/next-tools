import { Binary } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.text-to-binary.title')),
  path: '/text-to-binary',
  key: 'text-to-binary',
  description: computed(() => translate('tools.text-to-binary.description')),
  keywords: computed(() => translate('tools.text-to-binary.keywords')),
  component: () => import('./text-to-binary.vue'),
  icon: Binary,
  createdAt: new Date('2023-10-15'),
})
