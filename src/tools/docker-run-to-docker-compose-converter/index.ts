import { Box } from 'lucide-vue-next';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.docker-run-to-docker-compose-converter.title')),
  path: '/docker-run-to-docker-compose-converter',
  key: 'docker-run-to-docker-compose-converter',
  description: computed(() => translate('tools.docker-run-to-docker-compose-converter.description')),
  keywords: computed(() => translate('tools.docker-run-to-docker-compose-converter.keywords')),
  component: () => import('./docker-run-to-docker-compose-converter.vue'),
  icon: Box,
})
