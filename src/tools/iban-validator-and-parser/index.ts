import { computed } from 'vue';
import { Building2 } from 'lucide-vue-next'
import { translate } from '@/plugins/i18n.plugin'
import { defineTool } from '../tool'

export const tool = defineTool({
  name: computed(() => translate('tools.iban-validator-and-parser.title')),
  path: '/iban-validator-and-parser',
  key: 'iban-validator-and-parser',
  description: computed(() => translate('tools.iban-validator-and-parser.description')),
  keywords: computed(() => translate('tools.iban-validator-and-parser.keywords')),
  component: () => import('./iban-validator-and-parser.vue'),
  icon: Building2,
  createdAt: new Date('2023-08-26'),
});
