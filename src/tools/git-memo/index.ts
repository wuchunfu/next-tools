import { GitBranch } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.git-memo.title')),
  path: '/git-memo',
  key: 'git-memo',
  description: computed(() => translate('tools.git-memo.description')),
  keywords: computed(() => translate('tools.git-memo.keywords')),
  component: () => import('./git-memo.vue'),
  icon: GitBranch,
})
