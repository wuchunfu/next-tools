import { Camera } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.camera-recorder.title')),
  path: '/camera-recorder',
  key: 'camera-recorder',
  description: computed(() => translate('tools.camera-recorder.description')),
  keywords: computed(() => translate('tools.camera-recorder.keywords')),
  component: () => import('./camera-recorder.vue'),
  icon: Camera,
  createdAt: new Date('2023-05-15'),
})
