<script setup lang="ts">
import { parse as parseToml } from 'smol-toml'
import { FileCode, X } from 'lucide-vue-next';
import { stringify as stringifyToYaml } from 'yaml';
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

const tomlInput = ref('')

const yamlOutput = computed(() => {
  if (!tomlInput.value.trim()) { return '' }
  return withDefaultOnError(() => {
    // Parse TOML with BigInt support for large integers
    const obj = parseToml(tomlInput.value, { integersAsBigInt: true })
    if (!obj) { return '' }
    return stringifyToYaml(obj, { indent: 2 })
  }, '')
});

const tomlInputValidation = useValidation({
  source: tomlInput,
  rules: computed(() => [
    {
      validator: (value: string) => !value.trim() || isNotThrowing(() => parseToml(value, { integersAsBigInt: true })),
      message: t('tools.toml-to-yaml.invalidToml', 'Invalid TOML'),
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
            {{ t('tools.toml-to-yaml.cardInputTitle', 'TOML input') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.toml-to-yaml.cardInputDescription',
                'Paste your TOML content below, we will validate it and convert it to YAML.',
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
                :placeholder="t('tools.toml-to-yaml.inputPlaceholder', 'Paste your TOML here...')"
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
                v-if="tomlInputValidation.status === 'error'"
                variant="destructive"
                class="border-destructive/40 bg-destructive/10"
              >
                <AlertTitle class="text-sm">
                  {{ t('tools.toml-to-yaml.invalidTomlTitle', 'Invalid TOML') || t('tools.toml-to-yaml.invalidToml', 'Invalid TOML') }}
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
            {{ t('tools.toml-to-yaml.cardOutputTitle', 'YAML output') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.toml-to-yaml.cardOutputDescription',
                'Review and copy the converted YAML representation of your TOML.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldContent>
              <TextareaCopyable :value="yamlOutput" language="yaml" class="min-h-20" />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
</template>
