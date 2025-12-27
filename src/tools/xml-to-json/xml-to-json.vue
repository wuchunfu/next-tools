<script setup lang="ts">
import { XMLParser } from 'fast-xml-parser'
import { FileCode, X } from 'lucide-vue-next';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToolI18n } from '@/composable/useToolI18n';
import { useValidation } from '@/composable/validation';
import { withDefaultOnError } from '@/utils/defaults';
import { isValidXML } from '../xml-formatter/xml-formatter.service';

const inputElement = ref<HTMLElement>()

const { t } = useToolI18n()

const xmlInput = ref('')
const formatJson = ref(true)

const jsonOutput = computed(() => {
  if (!xmlInput.value.trim()) { return '' }
  return withDefaultOnError(() => {
    const parser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: true,
    })
    const obj = parser.parse(xmlInput.value)
    if (!obj) { return '' }
    return formatJson.value ? JSON.stringify(obj, null, 2) : JSON.stringify(obj)
  }, '')
});

const xmlInputValidation = useValidation({
  source: xmlInput,
  rules: computed(() => [
    {
      validator: (value: string) => !value.trim() || isValidXML(value),
      message: t('tools.xml-to-json.invalidXml', 'Invalid XML'),
    },
  ]),
})

function clearInput() {
  xmlInput.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileCode class="h-5 w-5 text-primary" />
            {{ t('tools.xml-to-json.cardInputTitle', 'XML input') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.xml-to-json.cardInputDescription',
                'Paste your XML content below, we will validate it and convert it to JSON.',
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
                id="xml-input"
                ref="inputElement"
                v-model="xmlInput"
                :placeholder="t('tools.xml-to-json.inputPlaceholder', 'Paste your XML content here...')"
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
                v-if="xmlInputValidation.status === 'error'"
                variant="destructive"
                class="border-destructive/40 bg-destructive/10"
              >
                <AlertTitle class="text-sm">
                  {{ t('tools.xml-to-json.invalidXmlTitle', 'Invalid XML') || t('tools.xml-to-json.invalidXml', 'Invalid XML') }}
                </AlertTitle>
                <AlertDescription class="text-xs">
                  {{ xmlInputValidation.message }}
                </AlertDescription>
              </Alert>
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card v-if="xmlInputValidation.status !== 'error'" class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileCode class="h-5 w-5 text-primary" />
            {{ t('tools.xml-to-json.cardOutputTitle', 'JSON output') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.xml-to-json.cardOutputDescription',
                'Review and copy the converted JSON representation of your XML.',
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
                  {{ t('tools.xml-to-json.formatJson', 'Format JSON') }}
                </span>
                <Switch v-model="formatJson" />
              </div>
              <TextareaCopyable :value="jsonOutput" language="json" class="min-h-20" />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
</template>
