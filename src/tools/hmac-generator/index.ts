import { ShortTextRound } from '@vicons/material';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.hmac-generator.title')),
  path: '/hmac-generator',
  key: 'hmac-generator',
  description: computed(() => translate('tools.hmac-generator.description')),
  keywords: computed(() => translate('tools.hmac-generator.keywords')),
  component: () => import('./hmac-generator.vue'),
  icon: ShortTextRound,
})
