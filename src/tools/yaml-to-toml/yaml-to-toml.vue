<script setup lang="ts">
import { stringify as stringifyToml } from 'smol-toml'
import { FileCode, X } from 'lucide-vue-next';
import { parse as parseYaml } from 'yaml';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { useToolI18n } from '@/composable/useToolI18n';
import { useValidation } from '@/composable/validation';
import { withDefaultOnError } from '@/utils/defaults';

const inputElement = ref<HTMLElement>()

const { t } = useToolI18n()

const yamlInput = ref('')
const tomlOutput = computed(() => {
  if (!yamlInput.value.trim()) { return '' }
  return withDefaultOnError(() => {
    const obj = parseYaml(yamlInput.value, { intAsBigInt: true });
    return stringifyToml(obj)
  }, '')
});

const yamlInputValidation = useValidation({
  source: yamlInput,
  rules: computed(() => [
    {
      validator: (v: string) => !v.trim() || !!parseYaml(v),
      message: t('tools.yaml-to-toml.invalidYaml', 'Invalid YAML'),
    },
  ]),
})

function clearInput() {
  yamlInput.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileCode class="h-5 w-5 text-primary" />
            {{ t('tools.yaml-to-toml.cardInputTitle', 'YAML input') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.yaml-to-toml.cardInputDescription',
                'Paste your YAML content below, we will validate it and convert it to TOML.',
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
                id="yaml-input"
                ref="inputElement"
                v-model="yamlInput"
                :placeholder="t('tools.yaml-to-toml.inputPlaceholder', 'Paste your YAML here...')"
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
                v-if="yamlInputValidation.status === 'error'"
                variant="destructive"
                class="border-destructive/40 bg-destructive/10"
              >
                <AlertTitle class="text-sm">
                  {{ t('tools.yaml-to-toml.invalidYamlTitle', 'Invalid YAML') || t('tools.yaml-to-toml.invalidYaml', 'Invalid YAML') }}
                </AlertTitle>
                <AlertDescription class="text-xs">
                  {{ yamlInputValidation.message }}
                </AlertDescription>
              </Alert>
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card v-if="yamlInputValidation.status !== 'error'" class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileCode class="h-5 w-5 text-primary" />
            {{ t('tools.yaml-to-toml.cardOutputTitle', 'TOML output') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.yaml-to-toml.cardOutputDescription',
                'Review and copy the converted TOML representation of your YAML.',
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
