import { Smile } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.emoji-picker.title')),
  path: '/emoji-picker',
  key: 'emoji-picker',
  description: computed(() => translate('tools.emoji-picker.description')),
  keywords: computed(() => translate('tools.emoji-picker.keywords')),
  component: () => import('./emoji-picker.vue'),
  icon: Smile,
  createdAt: new Date('2023-08-07'),
})
