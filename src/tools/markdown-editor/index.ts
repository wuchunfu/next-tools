import { FileEdit } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  key: 'markdown-editor',
  name: computed(() => translate('tools.markdown-editor.title')),
  path: '/markdown-editor',
  description: computed(() => translate('tools.markdown-editor.description')),
  keywords: computed(() => translate('tools.markdown-editor.keywords')),
  component: () => import('./markdown-editor.vue'),
  icon: FileEdit,
  createdAt: new Date('2026-01-28'),
});