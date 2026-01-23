<script setup lang="ts">
import { watch } from 'vue';
import { getCountries, getCountryCallingCode, parsePhoneNumber } from 'libphonenumber-js/max';
import countries from 'i18n-iso-countries';

// Pre-import all supported language files
import en from 'i18n-iso-countries/langs/en.json';
import zh from 'i18n-iso-countries/langs/zh.json';
import de from 'i18n-iso-countries/langs/de.json';
import es from 'i18n-iso-countries/langs/es.json';
import fr from 'i18n-iso-countries/langs/fr.json';
import no from 'i18n-iso-countries/langs/no.json';
import pt from 'i18n-iso-countries/langs/pt.json';
import uk from 'i18n-iso-countries/langs/uk.json';
import vi from 'i18n-iso-countries/langs/vi.json';
import {
  formatTypeToHumanReadable,
  getDefaultCountryCode,
  getFullCountryName,
} from './phone-parser-and-formatter.models';
import { withDefaultOnError } from '@/utils/defaults';
import { booleanToHumanReadable } from '@/utils/boolean';
import { useValidation } from '@/composable/validation';
import { useToolI18n } from '@/composable/useToolI18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input'
import InputCopyable from '@/components/InputCopyable.vue';
import { CheckIcon, ChevronsUpDownIcon, Phone } from 'lucide-vue-next';
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'
import type { CountryCode } from 'libphonenumber-js/types';

// Create a language map
const languageMap: Record<string, any> = {
  en,
  zh,
  de,
  es,
  fr,
  no,
  pt,
  uk,
  vi,
};

const rawPhone = ref('');
const defaultCountryCode = ref(getDefaultCountryCode());
const { t, locale } = useToolI18n();

const supportedLanguages = countries.getSupportedLanguages();
const registeredLanguages = new Set<string>();

function registerCountryLanguage(lang: string) {
  let langCode: string = lang.split('-')[0] || 'en'

  if (!supportedLanguages.includes(langCode)) {
    langCode = 'en'
  }

  if (registeredLanguages.has(langCode)) {
    return
  }

  const langData = languageMap[langCode]
  if (langData) {
    countries.registerLocale(langData)
    registeredLanguages.add(langCode)
  }
}

watch(locale, (newLocale) => {
  registerCountryLanguage(newLocale);
}, { immediate: true });
const validation = useValidation({
  source: rawPhone,
  rules: computed(() => [
    {
      validator: (value: string) => value === '' || /^[0-9 +\-()]+$/.test(value),
      message: t('tools.phone-parser-and-formatter.invalid', 'Invalid phone number'),
    },
  ]),
});

const parsedDetails = computed(() => {
  if (!validation.isValid) {
    return undefined;
  }

  const parsed = withDefaultOnError(() => parsePhoneNumber(rawPhone.value, defaultCountryCode.value), undefined);

  if (!parsed) {
    return undefined;
  }

  return [
    {
      label: t('tools.phone-parser-and-formatter.country'),
      value: parsed.country,
    },
    {
      label: t('tools.phone-parser-and-formatter.countryName'),
      value: getFullCountryName(parsed.country, locale.value),
    },
    {
      label: t('tools.phone-parser-and-formatter.countryCallingCode'),
      value: parsed.countryCallingCode,
    },
    {
      label: t('tools.phone-parser-and-formatter.isValid'),
      value: booleanToHumanReadable(parsed.isValid(), t),
    },
    {
      label: t('tools.phone-parser-and-formatter.isPossible'),
      value: booleanToHumanReadable(parsed.isPossible(), t),
    },
    {
      label: t('tools.phone-parser-and-formatter.type'),
      value: formatTypeToHumanReadable(parsed.getType()),
    },
    {
      label: t('tools.phone-parser-and-formatter.international'),
      value: parsed.formatInternational(),
    },
    {
      label: t('tools.phone-parser-and-formatter.national'),
      value: parsed.formatNational(),
    },
    {
      label: t('tools.phone-parser-and-formatter.e164'),
      value: parsed.format('E.164'),
    },
    {
      label: t('tools.phone-parser-and-formatter.rfc3966'),
      value: parsed.format('RFC3966'),
    },
  ];
})

const filteredParsedDetails = computed(() => parsedDetails.value?.filter(detail => detail.value !== undefined));

const countriesOptions = computed(() =>
  getCountries().map(code => ({
    label: `${countries.getName(code, locale.value) || code} (+${getCountryCallingCode(code)})`,
    value: code,
  })),
);

const popoverOpen = ref(false);
const comboboxValue = ref<CountryCode | undefined>(defaultCountryCode.value);

watch(defaultCountryCode, (v) => {
  comboboxValue.value = v;
})
watch(comboboxValue, (v) => {
  defaultCountryCode.value = v as CountryCode;
})

const selectedCountry = computed(() =>
  countriesOptions.value.find((c: { value: CountryCode, label: string }) => c.value === comboboxValue.value),
);

function selectCountry(selectedValue: CountryCode) {
  comboboxValue.value = selectedValue === comboboxValue.value ? undefined : selectedValue;
  popoverOpen.value = false;
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Input Card -->
    <Card>
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Phone class="h-5 w-5 text-primary" />
            {{ t('tools.phone-parser-and-formatter.cardTitle') }}
          </CardTitle>
          <CardDescription>{{ t('tools.phone-parser-and-formatter.cardDescription') }}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <Field>
            <FieldLabel>{{ t('tools.phone-parser-and-formatter.defaultCode') }}</FieldLabel>
            <FieldContent>
              <Popover v-model:open="popoverOpen">
                <PopoverTrigger as-child>
                  <Button
                    variant="outline"
                    role="combobox"
                    :aria-expanded="popoverOpen"
                    class="w-[320px] justify-between"
                  >
                    {{ selectedCountry?.label || t('tools.phone-parser-and-formatter.defaultCode') }}
                    <ChevronsUpDownIcon class="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-[320px] p-0">
                  <Command>
                    <CommandInput class="h-9" :placeholder="t('tools.phone-parser-and-formatter.defaultCode')" />
                    <CommandList>
                      <CommandEmpty>{{ t('common.noResults', 'No results') }}</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          v-for="opt in countriesOptions"
                          :key="opt.value"
                          :value="opt.value"
                          @select="(ev) => selectCountry(ev.detail.value as CountryCode)"
                        >
                          {{ opt.label }}
                          <CheckIcon
                            :class="cn('ml-auto', comboboxValue === opt.value ? 'opacity-100' : 'opacity-0')"
                            class="h-4 w-4"
                          />
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>{{ t('tools.phone-parser-and-formatter.label') }}</FieldLabel>
            <FieldContent>
              <Input v-model="rawPhone" :placeholder="t('tools.phone-parser-and-formatter.placeholder')" />
            </FieldContent>
          </Field>
        </div>
      </CardContent>
    </Card>

    <!-- Results Card -->
    <Card v-if="filteredParsedDetails?.length">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Phone class="h-5 w-5 text-primary" />
            {{ t('tools.phone-parser-and-formatter.cardResultsTitle', 'Results') }}
          </CardTitle>
          <CardDescription>
            {{
              t('tools.phone-parser-and-formatter.cardResultsDescription', 'Parsed formats and metadata')
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldContent>
              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <template v-for="{ label, value } in filteredParsedDetails || []" :key="label">
                  <InputCopyable :value="value as string" :label="label" readonly :field-props="{ orientation: 'vertical' }" />
                </template>
              </div>
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
</template>
