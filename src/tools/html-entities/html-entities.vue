<script setup lang="ts">
import { escape, unescape } from 'lodash';
import { X } from 'lucide-vue-next'
import InputCopyable from '@/components/InputCopyable.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldLabel, FieldSet } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useToolI18n } from '@/composable/useToolI18n'

const { t } = useToolI18n();

const escapeInput = ref('');
const escapeOutput = computed(() => escape(escapeInput.value));

const unescapeInput = ref('');
const unescapeOutput = computed(() => unescape(unescapeInput.value));

function clearEscape() {
  escapeInput.value = '';
}

function clearUnescape() {
  unescapeInput.value = '';
}
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Escape -->
    <Card class="flex flex-col">
      <CardHeader class="pb-3">
        <div class="space-y-1">
          <CardTitle>{{ t('tools.html-entities.cardEscapeTitle', 'Escape HTML Entities') }}</CardTitle>
          <CardDescription>
            {{ t('tools.html-entities.cardEscapeDescription', 'Escape HTML entities (replace characters like <, >, &, " and \' with their HTML version).') }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent class="flex flex-1 flex-col gap-6">
        <FieldSet>
          <Field orientation="vertical" class="gap-3">
            <FieldLabel class="text-sm font-medium">
              {{ t('tools.html-entities.inputLabel', 'Your string') }}
            </FieldLabel>
            <FieldContent>
              <Textarea
                v-model="escapeInput"
                :placeholder="t('tools.html-entities.inputPlaceholder', 'Enter the string to escape...')"
                rows="6"
                class="w-full min-w-0 max-h-96 resize-y overflow-y-auto"
              />
            </FieldContent>
            <div class="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" @click="clearEscape">
                <X class="mr-2 h-4 w-4" />
                {{ t('common.clear', 'Clear') }}
              </Button>
            </div>
          </Field>
        </FieldSet>

        <Separator />

        <Field orientation="vertical">
          <FieldLabel>{{ t('tools.html-entities.outputLabel', 'Escaped string') }}</FieldLabel>
          <FieldContent>
            <InputCopyable
              :value="escapeOutput"
              :placeholder="t('tools.html-entities.outputPlaceholder', 'Escaped string will appear here...')"
              :field-props="{ orientation: 'vertical' }"
              readonly
            />
          </FieldContent>
        </Field>
      </CardContent>
    </Card>

    <!-- Unescape -->
    <Card class="flex flex-col">
      <CardHeader class="pb-3">
        <div class="space-y-1">
          <CardTitle>{{ t('tools.html-entities.cardUnescapeTitle', 'Unescape HTML Entities') }}</CardTitle>
          <CardDescription>
            {{ t('tools.html-entities.cardUnescapeDescription', 'Unescape HTML entities (convert HTML entities back to their original characters).') }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent class="flex flex-1 flex-col gap-6">
        <FieldSet>
          <Field orientation="vertical" class="gap-3">
            <FieldLabel class="text-sm font-medium">
              {{ t('tools.html-entities.unescapeInputLabel', 'Your escaped string') }}
            </FieldLabel>
            <FieldContent>
              <Textarea
                v-model="unescapeInput"
                :placeholder="t('tools.html-entities.unescapeInputPlaceholder', 'Enter the HTML-escaped string to unescape...')"
                rows="6"
                class="w-full min-w-0 max-h-96 resize-y overflow-y-auto font-mono"
              />
            </FieldContent>
            <div class="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" @click="clearUnescape">
                <X class="mr-2 h-4 w-4" />
                {{ t('common.clear', 'Clear') }}
              </Button>
            </div>
          </Field>
        </FieldSet>

        <Separator />

        <Field orientation="vertical">
          <FieldLabel>{{ t('tools.html-entities.unescapeOutputLabel', 'Unescaped string') }}</FieldLabel>
          <FieldContent>
            <InputCopyable
              :value="unescapeOutput"
              :placeholder="t('tools.html-entities.unescapeOutputPlaceholder', 'Unescaped string will appear here...')"
              :field-props="{ orientation: 'vertical' }"
              readonly
            />
          </FieldContent>
        </Field>
      </CardContent>
    </Card>
  </div>
</template>
