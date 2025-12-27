import { Speakerphone } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.text-to-nato-alphabet.title')),
  path: '/text-to-nato-alphabet',
  key: 'text-to-nato-alphabet',
  description: computed(() => translate('tools.text-to-nato-alphabet.description')),
  keywords: computed(() => translate('tools.text-to-nato-alphabet.keywords')),
  component: () => import('./text-to-nato-alphabet.vue'),
  icon: Speakerphone,
})
