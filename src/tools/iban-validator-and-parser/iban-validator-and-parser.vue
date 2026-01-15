<script setup lang="ts">
import { extractIBAN, friendlyFormatIBAN, isQRIBAN, validateIBAN } from 'ibantools'
import { Banknote } from 'lucide-vue-next';
import CopyableCell from '@/components/CopyableCell.vue';
import InputCopyable from '@/components/InputCopyable.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToolI18n } from '@/composable/useToolI18n';
import { booleanToHumanReadable } from '@/utils/boolean';
import { tableCellClasses, tableContainerClasses, tableHeadClasses, tableHeaderClasses } from '@/utils/table';
import { getFriendlyErrors } from './iban-validator-and-parser.service'

const rawIban = ref('')
const { t } = useToolI18n()

const ibanInfo = computed(() => {
  const iban = rawIban.value.toUpperCase().replace(/\s/g, '').replace(/-/g, '')

  if (iban === '') {
    return []
  }

  const { valid: isIbanValid, errorCodes } = validateIBAN(iban)
  const { countryCode, bban } = extractIBAN(iban)
  const errors = getFriendlyErrors(errorCodes)

  return [
    {
      label: t('tools.iban-validator-and-parser.isValid'),
      value: booleanToHumanReadable(isIbanValid, t),
    },
    {
      label: t('tools.iban-validator-and-parser.errors'),
      value: errors.length === 0 ? undefined : errors.join(', '),
    },
    {
      label: t('tools.iban-validator-and-parser.isQrIban'),
      value: booleanToHumanReadable(isQRIBAN(iban), t),
    },
    {
      label: t('tools.iban-validator-and-parser.countryCode'),
      value: countryCode,
    },
    {
      label: t('tools.iban-validator-and-parser.bban'),
      value: bban,
    },
    {
      label: t('tools.iban-validator-and-parser.friendlyFormat'),
      value: friendlyFormatIBAN(iban),
    },
  ].filter(item => item.value !== undefined)
});

const ibanExamples = [
  {
    iban: 'FR7630006000011234567890189',
    country: 'France',
    friendlyFormat: friendlyFormatIBAN('FR7630006000011234567890189'),
  },
  {
    iban: 'DE89370400440532013000',
    country: 'Germany',
    friendlyFormat: friendlyFormatIBAN('DE89370400440532013000'),
  },
  {
    iban: 'GB29NWBK60161331926819',
    country: 'United Kingdom',
    friendlyFormat: friendlyFormatIBAN('GB29NWBK60161331926819'),
  },
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Input Card -->
    <Card>
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Banknote class="h-5 w-5 text-primary" />
            {{ t('tools.iban-validator-and-parser.cardTitle', 'IBAN Validator & Parser') }}
          </CardTitle>
          <CardDescription>{{ t('tools.iban-validator-and-parser.cardDescription', 'Validate and parse International Bank Account Numbers (IBANs)') }}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Field>
          <FieldLabel>{{ t('tools.iban-validator-and-parser.label', 'IBAN') }}</FieldLabel>
          <FieldContent>
            <Input
              v-model="rawIban"
              :placeholder="t('tools.iban-validator-and-parser.placeholder')"
              data-testid="iban-input"
            />
          </FieldContent>
        </Field>
      </CardContent>
    </Card>

    <!-- Results Card -->
    <Card v-if="ibanInfo.length > 0">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Banknote class="h-5 w-5 text-primary" />
            {{ t('tools.iban-validator-and-parser.cardResultsTitle', 'Results') }}
          </CardTitle>
          <CardDescription>
            {{
              t('tools.iban-validator-and-parser.cardResultsDescription', 'Parsed IBAN information and validation results')
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <template v-for="item in ibanInfo" :key="item.label">
              <InputCopyable
                :value="item.value as string"
                :label="item.label"
                readonly
                :field-props="{ orientation: 'vertical' }"
              />
            </template>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>

    <!-- Examples Card -->
    <Card>
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Banknote class="h-5 w-5 text-primary" />
            {{ t('tools.iban-validator-and-parser.examplesTitle') }}
          </CardTitle>
          <CardDescription>{{ t('tools.iban-validator-and-parser.examplesDescription', 'Sample IBANs for testing') }}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <Table :container-class="tableContainerClasses">
            <TableHeader :class="tableHeaderClasses">
              <TableRow>
                <TableHead :class="tableHeadClasses">
{{ t('tools.iban-validator-and-parser.iban', 'IBAN') }}
</TableHead>
                <TableHead :class="tableHeadClasses">
{{ t('tools.iban-validator-and-parser.formatted', 'Formatted') }}
</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="example in ibanExamples" :key="example.iban">
                <TableCell :class="tableCellClasses">
                  <CopyableCell :value="example.iban" />
                </TableCell>
                <TableCell :class="tableCellClasses">
                  <CopyableCell :value="example.friendlyFormat || example.iban" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
