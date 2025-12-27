import { SpeedFilled } from '@vicons/material';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.benchmark-builder.title')),
  path: '/benchmark-builder',
  key: 'benchmark-builder',
  description: computed(() => translate('tools.benchmark-builder.description')),
  keywords: computed(() => translate('tools.benchmark-builder.keywords')),
  component: () => import('./benchmark-builder.vue'),
  icon: SpeedFilled,
  createdAt: new Date('2023-04-05'),
})
