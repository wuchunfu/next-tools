import { FileText } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.markdown-to-html.title')),
  path: '/markdown-to-html',
  key: 'markdown-to-html',
  description: computed(() => translate('tools.markdown-to-html.description')),
  keywords: computed(() => translate('tools.markdown-to-html.keywords')),
  component: () => import('./markdown-to-html.vue'),
  icon: FileText,
  createdAt: new Date('2024-08-25'),
})
