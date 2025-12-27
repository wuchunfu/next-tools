import { Temperature } from '@vicons/tabler';
import { computed } from 'vue';
import { translate } from '@/plugins/i18n.plugin';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: computed(() => translate('tools.temperature-converter.title')),
  path: '/temperature-converter',
  key: 'temperature-converter',
  description: computed(() => translate('tools.temperature-converter.description')),
  keywords: [
    'temperature',
    'converter',
    'degree',
    'Kelvin',
    'Celsius',
    'Fahrenheit',
    'Rankine',
    'Delisle',
    'Newton',
    'Réaumur',
    'Rømer',
  ],
  component: () => import('./temperature-converter.vue'),
  icon: Temperature,
})
