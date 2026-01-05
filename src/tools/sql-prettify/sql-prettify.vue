<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { Database, Settings } from 'lucide-vue-next';
import type { FormatOptionsWithLanguage } from 'sql-formatter';
import { format as formatSQL } from 'sql-formatter';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToolI18n } from '@/composable/useToolI18n'
import { withDefaultOnError } from '@/utils/defaults'

const inputElement = ref<HTMLElement>()

const { t } = useToolI18n()
const config = useStorage<FormatOptionsWithLanguage>('sql-prettify:config', {
  keywordCase: 'upper',
  useTabs: false,
  language: 'sql',
  indentStyle: 'standard',
})

const rawSQL = ref('select field1,field2,field3 from my_table where my_condition;')

const prettySQL = computed(() => {
  if (!rawSQL.value.trim()) { return '' }
  return withDefaultOnError(() => formatSQL(rawSQL.value, config.value), '')
});

const dialectOptions = computed(() => [
  { label: t('tools.sql-prettify.gcpBigQuery'), value: 'bigquery' },
  { label: t('tools.sql-prettify.ibmDb2'), value: 'db2' },
  { label: t('tools.sql-prettify.apacheHive'), value: 'hive' },
  { label: t('tools.sql-prettify.mariadb'), value: 'mariadb' },
  { label: t('tools.sql-prettify.mysql'), value: 'mysql' },
  { label: t('tools.sql-prettify.couchbaseN1ql'), value: 'n1ql' },
  { label: t('tools.sql-prettify.oraclePlsql'), value: 'plsql' },
  { label: t('tools.sql-prettify.postgresql'), value: 'postgresql' },
  { label: t('tools.sql-prettify.amazonRedshift'), value: 'redshift' },
  { label: t('tools.sql-prettify.spark'), value: 'spark' },
  { label: t('tools.sql-prettify.standardSql'), value: 'sql' },
  { label: t('tools.sql-prettify.sqlite'), value: 'sqlite' },
  { label: t('tools.sql-prettify.sqlServerTsql'), value: 'tsql' },
])

const keywordCaseOptions = computed(() => [
  { label: t('tools.sql-prettify.uppercase'), value: 'upper' },
  { label: t('tools.sql-prettify.lowercase'), value: 'lower' },
  { label: t('tools.sql-prettify.preserve'), value: 'preserve' },
])

const indentStyleOptions = computed(() => [
  { label: t('tools.sql-prettify.standard'), value: 'standard' },
  { label: t('tools.sql-prettify.tabularLeft'), value: 'tabularLeft' },
  { label: t('tools.sql-prettify.tabularRight'), value: 'tabularRight' },
])

const currentDialectLabel = computed(() => {
  const option = dialectOptions.value.find(opt => opt.value === config.value.language)
  return option?.label || ''
});

const currentKeywordCaseLabel = computed(() => {
  const option = keywordCaseOptions.value.find(opt => opt.value === config.value.keywordCase)
  return option?.label || ''
});

const currentIndentStyleLabel = computed(() => {
  const option = indentStyleOptions.value.find(opt => opt.value === config.value.indentStyle)
  return option?.label || ''
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card>
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Settings class="h-5 w-5 text-primary" />
            {{ t('tools.sql-prettify.configTitle', 'Formatting Options') }}
          </CardTitle>
          <CardDescription>
            {{ t('tools.sql-prettify.configDescription', 'Configure SQL formatting options including dialect, keyword case, and indent style.') }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field orientation="vertical">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.sql-prettify.dialect') }}
              </FieldLabel>
              <FieldContent class="mt-2">
                <Select
                  :model-value="config.language"
                  @update:model-value="value => config.language = (value as FormatOptionsWithLanguage['language'])"
                >
                  <SelectTrigger class="w-full">
                    <SelectValue :placeholder="currentDialectLabel || t('tools.sql-prettify.dialect')" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="option in dialectOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field orientation="vertical">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.sql-prettify.keywordCase') }}
              </FieldLabel>
              <FieldContent class="mt-2">
                <Select
                  :model-value="config.keywordCase"
                  @update:model-value="value => config.keywordCase = (value as FormatOptionsWithLanguage['keywordCase'])"
                >
                  <SelectTrigger class="w-full">
                    <SelectValue :placeholder="currentKeywordCaseLabel || t('tools.sql-prettify.keywordCase')" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="option in keywordCaseOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field orientation="vertical">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.sql-prettify.indentStyle') }}
              </FieldLabel>
              <FieldContent class="mt-2">
                <Select
                  :model-value="config.indentStyle"
                  @update:model-value="value => config.indentStyle = (value as FormatOptionsWithLanguage['indentStyle'])"
                >
                  <SelectTrigger class="w-full">
                    <SelectValue :placeholder="currentIndentStyleLabel || t('tools.sql-prettify.indentStyle')" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="option in indentStyleOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Database class="h-5 w-5 text-primary" />
            {{ t('tools.sql-prettify.converterTitle', 'SQL Formatter') }}
          </CardTitle>
          <CardDescription>
            {{ t('tools.sql-prettify.converterDescription', 'Paste your SQL query and see the formatted output based on the configuration above.') }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel for="sql-input">
              {{ t('tools.sql-prettify.yourSqlQuery') }}
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="sql-input"
                ref="inputElement"
                v-model="rawSQL"
                :placeholder="t('tools.sql-prettify.inputPlaceholder')"
                rows="16"
                class="font-mono"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
              />
            </FieldContent>
          </Field>

          <Separator />

          <Field>
            <FieldLabel>{{ t('tools.sql-prettify.prettifyVersion') }}</FieldLabel>
            <FieldContent>
              <TextareaCopyable :value="prettySQL" language="sql" class="min-h-20" />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
</template>
