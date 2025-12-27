<script setup lang="ts">
import { stringify as stringifyToml } from 'iarna-toml-esm'
import JSON5 from 'json5'
import { FileCode, X } from 'lucide-vue-next'
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { useToolI18n } from '@/composable/useToolI18n';
import { useValidation } from '@/composable/validation';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';

const inputElement = ref<HTMLElement>()

const { t } = useToolI18n()

const jsonInput = ref('')
const tomlOutput = computed(() => {
  if (!jsonInput.value.trim()) { return '' }
  return withDefaultOnError(() => {
    const convertJsonToToml = (value: string) => [stringifyToml(JSON5.parse(value))].flat().join('\n').trim()
    return convertJsonToToml(jsonInput.value)
  }, '')
});

const jsonInputValidation = useValidation({
  source: jsonInput,
  rules: computed(() => [
    {
      validator: (value: string) => !value.trim() || isNotThrowing(() => JSON5.parse(value)),
      message: t('tools.json-to-toml.invalidJson', 'Invalid JSON'),
    },
  ]),
})

function clearInput() {
  jsonInput.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileCode class="h-5 w-5 text-primary" />
            {{ t('tools.json-to-toml.cardInputTitle', 'JSON input') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.json-to-toml.cardInputDescription',
                'Paste your JSON content below, we will validate it and convert it to TOML.',
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
                id="json-input"
                ref="inputElement"
                v-model="jsonInput"
                :placeholder="t('tools.json-to-toml.inputPlaceholder', 'Paste your JSON here...')"
                rows="16"
                class="max-h-96 resize-y overflow-y-auto font-mono"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
              />
              <div class="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" @click="clearInput">
                  <X class="mr-2 h-4 w-4" />
                  {{ t('common.clear', 'Clear') }}
                </Button>
              </div>
              <Alert
                v-if="jsonInputValidation.status === 'error'"
                variant="destructive"
                class="border-destructive/40 bg-destructive/10"
              >
                <AlertTitle class="text-sm">
                  {{ t('tools.json-to-toml.invalidJsonTitle', 'Invalid JSON') || t('tools.json-to-toml.invalidJson', 'Invalid JSON') }}
                </AlertTitle>
                <AlertDescription class="text-xs">
                  {{ jsonInputValidation.message }}
                </AlertDescription>
              </Alert>
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card v-if="jsonInputValidation.status !== 'error'" class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileCode class="h-5 w-5 text-primary" />
            {{ t('tools.json-to-toml.cardOutputTitle', 'TOML output') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.json-to-toml.cardOutputDescription',
                'Review and copy the converted TOML representation of your JSON.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldContent>
              <TextareaCopyable :value="tomlOutput" language="toml" class="min-h-20" />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
</template>
