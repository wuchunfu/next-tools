<script setup lang="ts">
import slugify from '@sindresorhus/slugify'
import { Link2, Trash2 } from 'lucide-vue-next'
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { useToolI18n } from '@/composable/useToolI18n';
import { withDefaultOnError } from '@/utils/defaults'

const { t } = useToolI18n()

const inputElement = ref<HTMLElement>()
const input = ref('')
const slug = computed(() => withDefaultOnError(() => slugify(input.value), ''))

function handleClear() {
  input.value = '';
}
</script>

<template>
  <div class="grid gap-6 md:grid-cols-2">
    <Card class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Link2 class="h-5 w-5 text-primary" />
            {{ t('tools.slugify-string.cardInputTitle', 'Original text') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.slugify-string.cardInputDescription',
                'Paste text to generate a URL-friendly slug. Great for URLs, filenames, and identifiers.',
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
                id="slug-input"
                ref="inputElement"
                v-model="input"
                :placeholder="t('tools.slugify-string.inputPlaceholder')"
                rows="8"
                class="max-h-96 resize-y overflow-y-auto"
                autofocus
              />
              <div class="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" :disabled="input.length === 0" @click="handleClear">
                  <Trash2 class="mr-2 h-4 w-4" />
                  {{ t('common.clear', 'Clear') }}
                </Button>
              </div>
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Link2 class="h-5 w-5 text-primary" />
            {{ t('tools.slugify-string.cardOutputTitle', 'Generated slug') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.slugify-string.cardOutputDescription',
                'Copy the generated slug and use it in your URLs, filenames, or IDs.',
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
                :value="slug"
                class="min-h-20"
                :placeholder="t('tools.slugify-string.outputPlaceholder')"
              />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
</template>
