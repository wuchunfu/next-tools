<script setup lang="ts">
import { SHA1 } from 'crypto-js'
import { Info, Network, X, Globe } from 'lucide-vue-next';
import InputCopyable from '@/components/InputCopyable.vue';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToolI18n } from '@/composable/useToolI18n';
import { useValidation } from '@/composable/validation';

const macAddress = ref('20:37:06:12:34:56')

const { t } = useToolI18n()

const addressValidation = useValidation({
  source: macAddress,
  rules: computed(() => [
    {
      message: t('tools.ipv6-ula-generator.invalidMacAddress', 'Invalid MAC address'),
      validator: (value: string) => !value.trim() || !!value.trim().match(/^([0-9A-F]{2}[:-]){2,5}([0-9A-F]{2})$/i),
    },
  ]),
})

const calculatedSections = computed(() => {
  if (addressValidation.status === 'error' || !macAddress.value.trim()) {
    return []
  }

  const timestamp = new Date().getTime()
  const hex40bit = SHA1(timestamp + macAddress.value)
    .toString()
    .substring(30)

  const ula = `fd${hex40bit.substring(0, 2)}:${hex40bit.substring(2, 6)}:${hex40bit.substring(6)}`

  return [
    {
      label: t('tools.ipv6-ula-generator.ula', 'IPv6 ULA'),
      value: `${ula}::/48`,
    },
    {
      label: t('tools.ipv6-ula-generator.first', 'First routable block'),
      value: `${ula}:0::/64`,
    },
    {
      label: t('tools.ipv6-ula-generator.last', 'Last routable block'),
      value: `${ula}:ffff::/64`,
    },
  ]
});

const showResult = computed(() => addressValidation.isValid && calculatedSections.value.length > 0)

function clearInput() {
  macAddress.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="gap-2">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Network class="h-5 w-5 text-primary" />
            {{ t('tools.ipv6-ula-generator.cardInputTitle', 'MAC address') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.ipv6-ula-generator.cardInputDescription',
                'Enter a MAC address to generate IPv6 ULA (Unique Local Address) prefixes using the IETF-recommended method.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldContent class="space-y-2">
              <Input
                id="mac-address-input"
                v-model="macAddress"
                :placeholder="t('tools.ipv6-ula-generator.placeholder', 'Type a MAC address')"
                class="font-mono"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                :aria-invalid="addressValidation.status === 'error'"
              />
              <div class="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" :disabled="macAddress.length === 0" @click="clearInput">
                  <X class="mr-2 h-4 w-4" />
                  {{ t('common.clear', 'Clear') }}
                </Button>
              </div>
              <Alert
                v-if="addressValidation.status === 'error'"
                variant="destructive"
                class="border-destructive/40 bg-destructive/10"
              >
                <AlertTitle class="text-sm">
                  {{ t('tools.ipv6-ula-generator.invalidAddressTitle', 'Invalid MAC address') }}
                </AlertTitle>
                <AlertDescription class="text-xs">
                  {{ addressValidation.message }}
                </AlertDescription>
              </Alert>
            </FieldContent>
          </Field>

          <Alert class="border-primary/40 bg-primary/10">
            <Info class="h-4 w-4 text-primary" />
            <AlertTitle class="text-sm">
              {{ t('tools.ipv6-ula-generator.infoTitle', 'Info') }}
            </AlertTitle>
            <AlertDescription class="text-xs">
              {{ t('tools.ipv6-ula-generator.info', 'This tool uses the first method suggested by IETF using the current timestamp plus the mac address, sha1 hashed, and the lower 40 bits to generate your random ULA.') }}
            </AlertDescription>
          </Alert>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card v-if="showResult" class="gap-2">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Globe class="h-5 w-5 text-primary" />
            {{ t('tools.ipv6-ula-generator.cardResultsTitle', 'Generated IPv6 ULA prefixes') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.ipv6-ula-generator.cardResultsDescription',
                'IPv6 ULA prefixes generated based on your MAC address. Click any value to copy it to the clipboard.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent class="space-y-3">
        <InputCopyable
          v-for="{ label, value } in calculatedSections"
          :key="label"
          :value="value"
          :label="label"
          :field-props="{ class: 'w-full' }"
          :label-props="{ class: 'w-40 text-right' }"
          readonly
        />
      </CardContent>
    </Card>
  </div>
</template>
