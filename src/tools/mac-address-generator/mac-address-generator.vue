<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { times } from 'lodash-es';
import { Settings, RefreshCw, List } from 'lucide-vue-next';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { computedRefreshable } from '@/composable/computedRefreshable';
import { useToolI18n } from '@/composable/useToolI18n';
import { usePartialMacAddressValidation } from '@/utils/macAddress';
import { generateRandomMacAddress } from './mac-adress-generator.models';

const amount = useStorage('mac-address-generator-amount', 1)
const macAddressPrefix = useStorage('mac-address-generator-prefix', '64:16:7F')

const prefixValidation = usePartialMacAddressValidation(macAddressPrefix)

const { t } = useToolI18n()

const caseOptions = computed(() => [
  { label: t('tools.mac-address-generator.uppercase'), value: 'upper' as const },
  { label: t('tools.mac-address-generator.lowercase'), value: 'lower' as const },
])
const caseSelection = useStorage<'upper' | 'lower'>('mac-address-generator-case', 'upper')
const caseTransformer = computed<(v: string) => string>(() =>
  caseSelection.value === 'lower' ? v => v.toLowerCase() : v => v.toUpperCase(),
)
const selectedCaseLabel = computed(() => {
  const option = caseOptions.value.find(opt => opt.value === caseSelection.value)
  return option?.label || t('tools.mac-address-generator.case', 'Case')
});

const separators = computed(() => [
  {
    label: ':',
    value: ':',
  },
  {
    label: '-',
    value: '-',
  },
  {
    label: '.',
    value: '.',
  },
  {
    label: t('tools.mac-address-generator.none'),
    value: 'none',
  },
])
const separatorStorage = useStorage('mac-address-generator-separator', ':')

const separator = computed({
  get: () => separatorStorage.value === '' ? 'none' : separatorStorage.value,
  set: (value: string) => {
    separatorStorage.value = value === 'none' ? '' : value
  },
})
const selectedSeparatorLabel = computed(() => {
  const option = separators.value.find(opt => opt.value === separator.value)
  return option?.label
});

const [macAddresses, refreshMacAddresses] = computedRefreshable(() => {
  if (!prefixValidation.isValid) {
    return ''
  }

  const ids = times(amount.value, () => caseTransformer.value(generateRandomMacAddress({
    prefix: macAddressPrefix.value,
    separator: separator.value,
  })))
  return ids.join('\n')
});

const showResult = computed(() => prefixValidation.isValid && macAddresses.value.length > 0)
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Settings class="h-5 w-5 text-primary" />
            {{ t('tools.mac-address-generator.cardOptionsTitle', 'Generation options') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.mac-address-generator.cardOptionsDescription',
                'Configure the options for generating random MAC addresses, including quantity, prefix, case, and separator.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup class="space-y-4">
          <Field>
            <FieldContent class="space-y-2">
              <div class="flex items-center gap-2">
                <label class="text-sm font-medium min-w-[120px]">
                  {{ t('tools.mac-address-generator.quantity', 'Quantity') }}
                </label>
                <Input
                  id="amount-input"
                  v-model.number="amount"
                  type="number"
                  min="1"
                  max="100"
                  class="flex-1"
                />
              </div>
            </FieldContent>
          </Field>

          <Field>
            <FieldContent class="space-y-2">
              <div class="flex items-center gap-2">
                <label class="text-sm font-medium min-w-[120px]">
                  {{ t('tools.mac-address-generator.macAddressPrefix', 'MAC address prefix') }}
                </label>
                <Input
                  id="prefix-input"
                  v-model="macAddressPrefix"
                  :placeholder="t('tools.mac-address-generator.prefixPlaceholder', 'Set a prefix, e.g. 64:16:7F')"
                  class="flex-1 font-mono"
                  spellcheck="false"
                  :aria-invalid="!prefixValidation.isValid"
                />
              </div>
              <Alert
                v-if="!prefixValidation.isValid"
                variant="destructive"
                class="border-destructive/40 bg-destructive/10"
              >
                <AlertTitle class="text-sm">
                  {{ t('tools.mac-address-generator.invalidPrefixTitle', 'Invalid prefix') }}
                </AlertTitle>
                <AlertDescription class="text-xs">
                  {{ prefixValidation.message }}
                </AlertDescription>
              </Alert>
            </FieldContent>
          </Field>

          <Field>
            <FieldContent>
              <div class="flex items-center gap-2">
                <label class="text-sm font-medium min-w-[120px]">
                  {{ t('tools.mac-address-generator.case', 'Case') }}
                </label>
                <Select
                  :model-value="caseSelection"
                  @update:model-value="value => (caseSelection = value as 'upper' | 'lower')"
                >
                  <SelectTrigger class="flex-1 sm:w-56">
                    <SelectValue>
                      {{ selectedCaseLabel }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem v-for="opt in caseOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </FieldContent>
          </Field>

          <Field>
            <FieldContent>
              <div class="flex items-center gap-2">
                <label class="text-sm font-medium min-w-[120px]">
                  {{ t('tools.mac-address-generator.separator', 'Separator') }}
                </label>
                <Select
                  v-model="separator"
                >
                  <SelectTrigger class="flex-1 sm:w-56">
                    <SelectValue>
                      {{ selectedSeparatorLabel }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem v-for="opt in separators" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </FieldContent>
          </Field>

          <div class="flex justify-end gap-2 pt-2">
            <Button data-testid="refresh" variant="secondary" @click="refreshMacAddresses()">
              <RefreshCw class="mr-2 h-4 w-4" />
              {{ t('tools.mac-address-generator.refresh', 'Refresh') }}
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card v-if="showResult" class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <List class="h-5 w-5 text-primary" />
            {{ t('tools.mac-address-generator.cardResultsTitle', 'Generated MAC addresses') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.mac-address-generator.cardResultsDescription',
                'Generated MAC addresses based on your configuration. Click the copy button to copy all addresses to the clipboard.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <TextareaCopyable :value="macAddresses" class="min-h-20" />
      </CardContent>
    </Card>
  </div>
</template>
