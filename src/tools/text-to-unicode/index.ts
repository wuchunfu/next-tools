import { TextWrap } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.text-to-unicode.title')),
  path: '/text-to-unicode',
  key: 'text-to-unicode',
  description: computed(() => translate('tools.text-to-unicode.description')),
  keywords: computed(() => translate('tools.text-to-unicode.keywords')),
  component: () => import('./text-to-unicode.vue'),
  icon: TextWrap,
  createdAt: new Date('2024-01-31'),
})
