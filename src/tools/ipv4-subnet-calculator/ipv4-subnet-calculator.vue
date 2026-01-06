<script setup lang="ts">
import { ChevronLeft, ChevronRight, Network, Table2 } from 'lucide-vue-next';

import { Netmask } from 'netmask';
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
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';
import { tableCellClasses, tableContainerClasses, tableHeadClasses, tableHeaderClasses } from '@/utils/table';
import { getIPClass } from './ipv4-subnet-calculator.models';

const ip = ref('192.168.0.1/24')

const getNetworkInfo = (address: string) => new Netmask(address.trim())

const networkInfo = computed(() => withDefaultOnError(() => getNetworkInfo(ip.value), undefined))

const { t } = useToolI18n()

const ipValidation = useValidation({
  source: ip,
  rules: computed(() => [
    {
      message: t('tools.ipv4-subnet-calculator.cannotParseAddress', 'We cannot parse this address, check the format'),
      validator: (value: string) => !value.trim() || isNotThrowing(() => getNetworkInfo(value.trim())),
    },
  ]),
})

const sections = computed(() => [
  {
    label: t('tools.ipv4-subnet-calculator.netmask', 'Netmask'),
    getValue: (block: Netmask) => block.toString(),
  },
  {
    label: t('tools.ipv4-subnet-calculator.networkAddress', 'Network address'),
    getValue: ({ base }: Netmask) => base,
  },
  {
    label: t('tools.ipv4-subnet-calculator.networkMask', 'Network mask'),
    getValue: ({ mask }: Netmask) => mask,
  },
  {
    label: t('tools.ipv4-subnet-calculator.networkMaskInBinary', 'Network mask in binary'),
    getValue: ({ bitmask }: Netmask) => ('1'.repeat(bitmask) + '0'.repeat(32 - bitmask)).match(/.{8}/g)?.join('.') ?? '',
  },
  {
    label: t('tools.ipv4-subnet-calculator.cidrNotation', 'CIDR notation'),
    getValue: ({ bitmask }: Netmask) => `/${bitmask}`,
  },
  {
    label: t('tools.ipv4-subnet-calculator.wildcardMask', 'Wildcard mask'),
    getValue: ({ hostmask }: Netmask) => hostmask,
  },
  {
    label: t('tools.ipv4-subnet-calculator.networkSize', 'Network size'),
    getValue: ({ size }: Netmask) => String(size),
  },
  {
    label: t('tools.ipv4-subnet-calculator.firstAddress', 'First address'),
    getValue: ({ first }: Netmask) => first,
  },
  {
    label: t('tools.ipv4-subnet-calculator.lastAddress', 'Last address'),
    getValue: ({ last }: Netmask) => last,
  },
  {
    label: t('tools.ipv4-subnet-calculator.broadcastAddress', 'Broadcast address'),
    getValue: ({ broadcast }: Netmask) => broadcast,
    undefinedFallback: t('tools.ipv4-subnet-calculator.noBroadcastAddress', 'No broadcast address with this mask'),
  },
  {
    label: t('tools.ipv4-subnet-calculator.ipClass', 'IP class'),
    getValue: ({ base: ip }: Netmask) => getIPClass({ ip }),
    undefinedFallback: t('tools.ipv4-subnet-calculator.unknownClassType', 'Unknown class type'),
  },
])

function switchToBlock({ count = 1 }: { count?: number }) {
  const next = networkInfo.value?.next(count)

  if (next) {
    ip.value = next.toString()
  }
}

const canGoPrevious = computed(() => {
  if (!networkInfo.value) { return false }
  try {
    const prev = networkInfo.value.next(-1)
    return prev !== null
  }
  catch {
    return false
  }
})

const canGoNext = computed(() => {
  if (!networkInfo.value) { return false }
  try {
    const next = networkInfo.value.next(1)
    return next !== null
  }
  catch {
    return false
  }
})

</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Network class="h-5 w-5 text-primary" />
            {{ t('tools.ipv4-subnet-calculator.cardInputTitle', 'IPv4 address') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.ipv4-subnet-calculator.cardInputDescription',
                'Enter an IPv4 address with or without CIDR notation to calculate subnet information.',
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
                id="ip-input"
                v-model="ip"
                :placeholder="t('tools.ipv4-subnet-calculator.inputPlaceholder', 'The ipv4 address...')"
                class="font-mono"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
              />
              <Alert
                v-if="ipValidation.status === 'error'"
                variant="destructive"
                class="border-destructive/40 bg-destructive/10"
              >
                <AlertTitle class="text-sm">
                  {{ t('tools.ipv4-subnet-calculator.invalidAddressTitle', 'Invalid address') }}
                </AlertTitle>
                <AlertDescription class="text-xs">
                  {{ ipValidation.message }}
                </AlertDescription>
              </Alert>
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card v-if="networkInfo" class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Table2 class="h-5 w-5 text-primary" />
            {{ t('tools.ipv4-subnet-calculator.cardResultsTitle', 'Subnet information') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.ipv4-subnet-calculator.cardResultsDescription',
                'Detailed network and subnet information for the entered IPv4 address.',
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
                  {{ t('tools.ipv4-subnet-calculator.property', 'Property') }}
                </TableHead>
                <TableHead :class="tableHeadClasses">
                  {{ t('tools.ipv4-subnet-calculator.value', 'Value') }}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="{ getValue, label, undefinedFallback } in sections" :key="label">
                <TableCell :class="cn(tableCellClasses, 'font-medium')">
                  {{ label }}
                </TableCell>
                <TableCell :class="tableCellClasses">
                  <CopyableCell
                    v-if="getValue(networkInfo)"
                    :value="getValue(networkInfo) || ''"
                  />
                  <span v-else class="text-muted-foreground">
                    {{ undefinedFallback }}
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div class="mt-6 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            :disabled="!canGoPrevious"
            @click="switchToBlock({ count: -1 })"
          >
            <ChevronLeft class="mr-2 h-4 w-4" />
            {{ t('tools.ipv4-subnet-calculator.previousBlock', 'Previous block') }}
          </Button>
          <Button
            variant="outline"
            :disabled="!canGoNext"
            @click="switchToBlock({ count: 1 })"
          >
            {{ t('tools.ipv4-subnet-calculator.nextBlock', 'Next block') }}
            <ChevronRight class="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
