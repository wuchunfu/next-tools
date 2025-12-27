import { EyeOff } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.hash-text.title')),
  path: '/hash-text',
  key: 'hash-text',
  description: computed(() => translate('tools.hash-text.description')),
  keywords: [
    'hash',
    'digest',
    'crypto',
    'security',
    'text',
    'MD5',
    'SHA1',
    'SHA256',
    'SHA224',
    'SHA512',
    'SHA384',
    'SHA3',
    'RIPEMD160',
  ],
  component: () => import('./hash-text.vue'),
  icon: EyeOff,
  redirectFrom: ['/hash'],
})
