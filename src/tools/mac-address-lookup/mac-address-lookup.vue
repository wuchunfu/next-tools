<script setup lang="ts">
import { Network, X, Info } from 'lucide-vue-next';
import db from 'oui-data';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToolI18n } from '@/composable/useToolI18n';
import { useValidation } from '@/composable/validation';

const getVendorValue = (address: string) => address.trim().replace(/[.:-]/g, '').toUpperCase().substring(0, 6)

const macAddress = ref('20:37:06:12:34:56')

const { t } = useToolI18n()

const macValidation = useValidation({
  source: macAddress,
  rules: computed(() => [
    {
      message: t('tools.mac-address-lookup.invalidMacAddress', 'Invalid MAC address'),
      validator: (value: string) => !value.trim() || !!value.trim().match(/^([0-9A-F]{2}[:-]){2,5}([0-9A-F]{2})$/i),
    },
  ]),
})

const details = computed<string | undefined>(() => {
  if (macValidation.status === 'error' || !macAddress.value.trim()) {
    return undefined
  }
  return (db as Record<string, string>)[getVendorValue(macAddress.value)]
});

const showResult = computed(() => macValidation.isValid && details.value !== undefined)

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
            {{ t('tools.mac-address-lookup.cardInputTitle', 'MAC address') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.mac-address-lookup.cardInputDescription',
                'Enter a MAC address to look up the vendor information from the OUI (Organizationally Unique Identifier) database.',
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
                :placeholder="t('tools.mac-address-lookup.placeholder', 'Type a MAC address')"
                class="font-mono"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                :aria-invalid="macValidation.status === 'error'"
              />
              <div class="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" :disabled="macAddress.length === 0" @click="clearInput">
                  <X class="mr-2 h-4 w-4" />
                  {{ t('common.clear', 'Clear') }}
                </Button>
              </div>
              <Alert
                v-if="macValidation.status === 'error'"
                variant="destructive"
                class="border-destructive/40 bg-destructive/10"
              >
                <AlertTitle class="text-sm">
                  {{ t('tools.mac-address-lookup.invalidAddressTitle', 'Invalid MAC address') }}
                </AlertTitle>
                <AlertDescription class="text-xs">
                  {{ macValidation.message }}
                </AlertDescription>
              </Alert>
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card v-if="showResult" class="gap-2">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Info class="h-5 w-5 text-primary" />
            {{ t('tools.mac-address-lookup.cardResultsTitle', 'Vendor information') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.mac-address-lookup.cardResultsDescription',
                'Vendor information retrieved from the OUI database based on the MAC address prefix.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <TextareaCopyable :value="details || ''" language="txt" class="min-h-20" />
      </CardContent>
    </Card>

    <Card v-else-if="macValidation.isValid && !details" class="gap-2">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Info class="h-5 w-5 text-primary" />
            {{ t('tools.mac-address-lookup.cardResultsTitle', 'Vendor information') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.mac-address-lookup.cardResultsDescription',
                'Vendor information retrieved from the OUI database based on the MAC address prefix.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div class="text-center py-8 text-muted-foreground italic">
          {{ t('tools.mac-address-lookup.unknown', 'Unknown vendor for this address') }}
        </div>
      </CardContent>
    </Card>
  </div>
</template>
