<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { CodeXml, Settings, Trash2 } from 'lucide-vue-next';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToolI18n } from '@/composable/useToolI18n';
import { useValidation } from '@/composable/validation';
import { formatXml, isValidXML } from './xml-formatter.service';

const defaultValue = '<hello><world>foo</world><world>bar</world></hello>'
const xmlInput = useStorage('xml-formatter:xml-input', defaultValue)
const indentSize = useStorage('xml-formatter:indent-size', 2)
const collapseContent = useStorage('xml-formatter:collapse-content', true)
const { t } = useToolI18n()

const inputElement = ref<HTMLElement>()

const xmlValidation = useValidation({
  source: xmlInput,
  rules: computed(() => [
    {
      validator: (v: string) => !v.trim() || isValidXML(v),
      message: t('tools.xml-formatter.invalid', 'Invalid XML'),
    },
  ]),
})

const formattedXml = computed(() => {
  if (!xmlInput.value.trim()) { return '' }
  return formatXml(xmlInput.value, {
    indentation: ' '.repeat(Math.max(0, Math.min(10, Number(indentSize.value) || 0))),
    collapseContent: collapseContent.value,
    lineSeparator: '\n',
  })
});

function clearInput() {
  xmlInput.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="gap-2">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Settings class="h-5 w-5 text-primary" />
            {{ t('tools.xml-formatter.cardOptionsTitle', 'Formatting options') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.xml-formatter.cardOptionsDescription',
                'Tune indentation and collapsing behavior to match your preferred XML style.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="flex items-center justify-between rounded-lg border p-3">
            <div class="space-y-0.5">
              <p class="text-sm font-medium">
                {{ t('tools.xml-formatter.collapse', 'Collapse content') }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ t('tools.xml-formatter.collapseHint', 'Collapse text content into a single line when possible.') }}
              </p>
            </div>
            <Switch v-model="collapseContent" />
          </div>

          <div class="flex items-center justify-between rounded-lg border p-3">
            <div class="space-y-0.5">
              <p class="text-sm font-medium">
                {{ t('tools.xml-formatter.indent', 'Indent size') }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ t('tools.xml-formatter.indentHint', 'Number of spaces to use for indentation (0–10).') }}
              </p>
            </div>
            <Input
              v-model.number="indentSize"
              type="number"
              min="0"
              max="10"
              step="1"
              class="w-24"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="gap-2">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <CodeXml class="h-5 w-5 text-primary" />
            {{ t('tools.xml-formatter.cardInputTitle', 'XML input') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.xml-formatter.cardInputDescription',
                'Paste your XML below. We will validate it and generate a formatted version.',
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
                :placeholder="t('tools.xml-formatter.inputPlaceholder', 'Paste your XML here...')"
                rows="16"
                class="max-h-96 resize-y overflow-y-auto font-mono"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
              />
              <div class="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" :disabled="xmlInput.length === 0" @click="clearInput">
                  <Trash2 class="mr-2 h-4 w-4" />
                  {{ t('common.clear', 'Clear') }}
                </Button>
              </div>
              <Alert
                v-if="xmlValidation.status === 'error'"
                variant="destructive"
                class="border-destructive/40 bg-destructive/10"
              >
                <AlertTitle class="text-sm">
                  {{ t('tools.xml-formatter.invalidXmlTitle', 'Invalid XML') || t('tools.xml-formatter.invalid', 'Invalid XML') }}
                </AlertTitle>
                <AlertDescription class="text-xs">
                  {{ xmlValidation.message }}
                </AlertDescription>
              </Alert>
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card v-if="xmlValidation.status !== 'error'" class="gap-2">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <CodeXml class="h-5 w-5 text-primary" />
            {{ t('tools.xml-formatter.cardOutputTitle', 'Formatted XML') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.xml-formatter.cardOutputDescription',
                'Review and copy the formatted XML output.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldContent>
              <TextareaCopyable :value="formattedXml" language="xml" class="min-h-20" />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
</template>
