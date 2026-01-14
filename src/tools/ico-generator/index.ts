import { FileImage } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  key: 'ico-generator',
  name: computed(() => translate('tools.ico-generator.title')),
  path: '/ico-generator',
  description: computed(() => translate('tools.ico-generator.description')),
  keywords: computed(() => translate('tools.ico-generator.keywords')),
  component: () => import('./ico-generator.vue'),
  icon: FileImage,
  createdAt: new Date('2026-01-14'),
});