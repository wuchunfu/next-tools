<script setup lang="ts">
import { ArrowLeftRight, Network, X } from 'lucide-vue-next';
import CopyableCell from '@/components/CopyableCell.vue';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup } from '@/components/ui/field';

import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToolI18n } from '@/composable/useToolI18n';
import { useValidation } from '@/composable/validation';
import { cn } from '@/lib/utils';
import { tableCellClasses, tableContainerClasses, tableHeadClasses, tableHeaderClasses } from '@/utils/table';
import { isValidIpv4 } from '../ipv4-address-converter/ipv4-address-converter.service';
import { calculateCidr } from './ipv4-range-expander.service';

const rawStartAddress = ref('192.168.1.1')
const rawEndAddress = ref('192.168.6.255')

const result = computed(() => calculateCidr({ startIp: rawStartAddress.value, endIp: rawEndAddress.value }))

const { t } = useToolI18n()

const resultRows = computed(() => {
  if (!result.value) { return [] }
  return [
    {
      label: t('tools.ipv4-range-expander.startAddress'),
      oldValue: rawStartAddress.value,
      newValue: result.value.newStart || '',
    },
    {
      label: t('tools.ipv4-range-expander.endAddress'),
      oldValue: rawEndAddress.value,
      newValue: result.value.newEnd || '',
    },
    {
      label: t('tools.ipv4-range-expander.addressesInRange'),
      oldValue: result.value.oldSize?.toLocaleString() || '',
      newValue: result.value.newSize?.toLocaleString() || '',
    },
    {
      label: t('tools.ipv4-range-expander.cidr'),
      oldValue: '',
      newValue: result.value.newCidr || '',
    },
  ]
});

const startIpValidation = useValidation({
  source: rawStartAddress,
  rules: computed(() => [
    {
      message: t('tools.ipv4-range-expander.invalidIpv4', 'Invalid ipv4 address'),
      validator: (ip: string) => !ip.trim() || isValidIpv4({ ip }),
    },
  ]),
})
const endIpValidation = useValidation({
  source: rawEndAddress,
  rules: computed(() => [
    {
      message: t('tools.ipv4-range-expander.invalidIpv4', 'Invalid ipv4 address'),
      validator: (ip: string) => !ip.trim() || isValidIpv4({ ip }),
    },
  ]),
})

const showResult = computed(() => endIpValidation.isValid && startIpValidation.isValid && result.value !== undefined)
const showInvalidCombination = computed(
  () => startIpValidation.isValid && endIpValidation.isValid && result.value === undefined,
)

function onSwitchStartEndClicked() {
  const tmpStart = rawStartAddress.value
  rawStartAddress.value = rawEndAddress.value
  rawEndAddress.value = tmpStart
}

function clearInput() {
  rawStartAddress.value = ''
  rawEndAddress.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Network class="h-5 w-5 text-primary" />
            {{ t('tools.ipv4-range-expander.cardInputTitle', 'IPv4 address range') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.ipv4-range-expander.cardInputDescription',
                'Enter the start and end IPv4 addresses to calculate the CIDR range and expanded address information.',
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
                <Input
                  id="start-address-input"
                  v-model="rawStartAddress"
                  :placeholder="t('tools.ipv4-range-expander.startAddressPlaceholder', 'Start IPv4 address...')"
                  class="font-mono flex-1"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                  :aria-invalid="startIpValidation.status === 'error'"
                />
              </div>
              <Alert
                v-if="startIpValidation.status === 'error'"
                variant="destructive"
                class="border-destructive/40 bg-destructive/10"
              >
                <AlertTitle class="text-sm">
                  {{ t('tools.ipv4-range-expander.invalidAddressTitle', 'Invalid start address') }}
                </AlertTitle>
                <AlertDescription class="text-xs">
                  {{ startIpValidation.message }}
                </AlertDescription>
              </Alert>
            </FieldContent>
          </Field>

          <Field>
            <FieldContent class="space-y-2">
              <div class="flex items-center gap-2">
                <Input
                  id="end-address-input"
                  v-model="rawEndAddress"
                  :placeholder="t('tools.ipv4-range-expander.endAddressPlaceholder', 'End IPv4 address...')"
                  class="font-mono flex-1"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                  :aria-invalid="endIpValidation.status === 'error'"
                />
              </div>
              <Alert
                v-if="endIpValidation.status === 'error'"
                variant="destructive"
                class="border-destructive/40 bg-destructive/10"
              >
                <AlertTitle class="text-sm">
                  {{ t('tools.ipv4-range-expander.invalidAddressTitle', 'Invalid end address') }}
                </AlertTitle>
                <AlertDescription class="text-xs">
                  {{ endIpValidation.message }}
                </AlertDescription>
              </Alert>
            </FieldContent>
          </Field>

          <div class="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              :disabled="!rawStartAddress.trim() || !rawEndAddress.trim()"
              @click="onSwitchStartEndClicked"
            >
              <ArrowLeftRight class="mr-2 h-4 w-4" />
              {{ t('tools.ipv4-range-expander.switchAddresses', 'Switch addresses') }}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              :disabled="!rawStartAddress.trim() && !rawEndAddress.trim()"
              @click="clearInput"
            >
              <X class="mr-2 h-4 w-4" />
              {{ t('common.clear', 'Clear') }}
            </Button>
          </div>

          <Alert v-if="showInvalidCombination" variant="destructive" class="border-destructive/40 bg-destructive/10">
            <AlertTitle class="text-sm">
              {{ t('tools.ipv4-range-expander.invalidCombination', 'Invalid address combination') }}
            </AlertTitle>
            <AlertDescription class="space-y-3">
              <div class="text-xs text-muted-foreground">
                {{ t('tools.ipv4-range-expander.invalidCombinationDescription', 'The end IPv4 address is lower than the start IPv4 address. This is not valid and no result could be calculated.') }}
              </div>
            </AlertDescription>
          </Alert>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card v-if="showResult" class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Network class="h-5 w-5 text-primary" />
            {{ t('tools.ipv4-range-expander.cardResultsTitle', 'Range expansion results') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.ipv4-range-expander.cardResultsDescription',
                'View the calculated CIDR range and expanded address information.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <Table :container-class="tableContainerClasses">
            <TableHeader :class="tableHeaderClasses">
              <TableRow>
                <TableHead :class="cn(tableHeadClasses)">
                  {{ t('tools.ipv4-range-expander.label', 'Label') }}
                </TableHead>
                <TableHead :class="tableHeadClasses">
                  {{ t('tools.ipv4-range-expander.oldValue', 'Old value') }}
                </TableHead>
                <TableHead :class="tableHeadClasses">
                  {{ t('tools.ipv4-range-expander.newValue', 'New value') }}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="{ label, oldValue, newValue } in resultRows" :key="label">
                <TableCell :class="cn(tableCellClasses, 'font-medium')">
                  {{ label }}
                </TableCell>
                <TableCell :class="tableCellClasses">
                  <CopyableCell v-if="oldValue" :value="oldValue" />
                  <span v-else class="text-muted-foreground">—</span>
                </TableCell>
                <TableCell :class="tableCellClasses">
                  <CopyableCell v-if="newValue" :value="newValue" />
                  <span v-else class="text-muted-foreground">—</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
