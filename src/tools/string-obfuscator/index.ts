import { EyeOff } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.string-obfuscator.title')),
  path: '/string-obfuscator',
  key: 'string-obfuscator',
  description: computed(() => translate('tools.string-obfuscator.description')),
  keywords: computed(() => translate('tools.string-obfuscator.keywords')),
  component: () => import('./string-obfuscator.vue'),
  icon: EyeOff,
  createdAt: new Date('2023-08-16'),
})
