<script setup lang="ts">
import { parse as parseToml } from 'smol-toml'
import JSONBig from 'json-bigint'
import { FileCode, X } from 'lucide-vue-next'
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToolI18n } from '@/composable/useToolI18n';
import { useValidation } from '@/composable/validation';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';

// Create a json-bigint instance that uses native BigInt
const JSONBigInt = JSONBig({ useNativeBigInt: true });

const inputElement = ref<HTMLElement>()

const { t } = useToolI18n()

const tomlInput = ref('')
const formatJson = ref(true)

const jsonOutput = computed(() => {
  if (!tomlInput.value.trim()) { return '' }
  return withDefaultOnError(() => {
    // Parse TOML with BigInt support for large integers
    const obj = parseToml(tomlInput.value, { integersAsBigInt: true })
    if (!obj) { return '' }
    return formatJson.value ? JSONBigInt.stringify(obj, null, 2) : JSONBigInt.stringify(obj)
  }, '')
});

const tomlInputValidation = useValidation({
  source: tomlInput,
  rules: computed(() => [
    {
      validator: (value: string) => !value.trim() || isNotThrowing(() => parseToml(value, { integersAsBigInt: true })),
      message: t('tools.toml-to-json.invalidToml', 'Invalid TOML'),
    },
  ]),
})

function clearInput() {
  tomlInput.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileCode class="h-5 w-5 text-primary" />
            {{ t('tools.toml-to-json.cardInputTitle', 'TOML input') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.toml-to-json.cardInputDescription',
                'Paste your TOML content below, we will validate it and convert it to JSON.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldContent class="space-y-2">
              <Textarea
                id="toml-input"
                ref="inputElement"
                v-model="tomlInput"
                :placeholder="t('tools.toml-to-json.inputPlaceholder', 'Paste your TOML here...')"
                rows="16"
                class="max-h-96 resize-y overflow-y-auto font-mono"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                data-testid="toml-input"
              />
              <div class="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" @click="clearInput">
                  <X class="mr-2 h-4 w-4" />
                  {{ t('common.clear', 'Clear') }}
                </Button>
              </div>
              <Alert
                v-if="tomlInputValidation.status === 'error'"
                variant="destructive"
                class="border-destructive/40 bg-destructive/10"
                data-testid="error-message"
              >
                <AlertTitle class="text-sm">
                  {{ t('tools.toml-to-json.invalidTomlTitle', 'Invalid TOML') || t('tools.toml-to-json.invalidToml', 'Invalid TOML') }}
                </AlertTitle>
                <AlertDescription class="text-xs">
                  {{ tomlInputValidation.message }}
                </AlertDescription>
              </Alert>
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card v-if="tomlInputValidation.status !== 'error'" class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileCode class="h-5 w-5 text-primary" />
            {{ t('tools.toml-to-json.cardOutputTitle', 'JSON output') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.toml-to-json.cardOutputDescription',
                'Review and copy the converted JSON representation of your TOML.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldContent class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">
                  {{ t('tools.toml-to-json.formatJson', 'Format JSON') }}
                </span>
                <Switch v-model="formatJson" />
              </div>
              <TextareaCopyable :value="jsonOutput" language="json" class="min-h-20" data-testid="json-output" />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
</template>
