<script setup lang="ts">
import { normalizeEmail } from 'email-normalizer'
import { Mail, Trash2 } from 'lucide-vue-next';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { useToolI18n } from '@/composable/useToolI18n';
import { withDefaultOnError } from '@/utils/defaults';

const inputElement = ref<HTMLElement>()
const { t } = useToolI18n()
const emails = ref('')

const normalizedEmails = computed(() => {
  if (!emails.value) {
    return ''
  }

  return emails.value
    .split('\n')
    .map((email) => {
      return withDefaultOnError(() => normalizeEmail({ email }), t('tools.email-normalizer.unableToParse', { email }))
    })
    .join('\n')
});

function clearInput() {
  emails.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="gap-2">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Mail class="h-5 w-5 text-primary" />
            {{ t('tools.email-normalizer.cardInputTitle', 'Email input') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.email-normalizer.cardInputDescription',
                'Paste your email addresses below (one per line). They will be normalized automatically.',
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
                id="email-input"
                ref="inputElement"
                v-model="emails"
                :placeholder="t('tools.email-normalizer.inputPlaceholder', 'Put your emails here (one per line)...')"
                rows="8"
                class="max-h-96 resize-y overflow-y-auto font-mono break-all"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                autofocus
              />
              <div class="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" :disabled="emails.length === 0" @click="clearInput">
                  <Trash2 class="mr-2 h-4 w-4" />
                  {{ t('common.clear', 'Clear') }}
                </Button>
              </div>
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card v-if="normalizedEmails" class="gap-2">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Mail class="h-5 w-5 text-primary" />
            {{ t('tools.email-normalizer.cardOutputTitle', 'Normalized emails') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.email-normalizer.cardOutputDescription',
                'Review and copy the normalized email addresses.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldContent>
              <TextareaCopyable
                :value="normalizedEmails"
                language="text"
                class="min-h-20"
                :placeholder="t('tools.email-normalizer.outputPlaceholder', 'Normalized emails will appear here...')"
              />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
</template>
