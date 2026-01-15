import { Edit } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.html-wysiwyg-editor.title')),
  path: '/html-wysiwyg-editor',
  key: 'html-wysiwyg-editor',
  description: computed(() => translate('tools.html-wysiwyg-editor.description')),
  keywords: computed(() => translate('tools.html-wysiwyg-editor.keywords')),
  component: () => import('./html-wysiwyg-editor.vue'),
  icon: Edit,
})
