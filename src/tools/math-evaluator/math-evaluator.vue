<script setup lang="ts">
import { Calculator, X } from 'lucide-vue-next';
import { evaluate } from 'mathjs';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { useToolI18n } from '@/composable/useToolI18n';
import { withDefaultOnError } from '@/utils/defaults';

const { t } = useToolI18n()
const expression = ref('')

const result = computed(() => withDefaultOnError(() => evaluate(expression.value) ?? '', ''))
const hasResult = computed(() => String(result.value) !== '' && expression.value.trim() !== '')

function clearExpression() {
  expression.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Calculator class="h-5 w-5 text-primary" />
            {{ t('tools.math-evaluator.cardInputTitle', 'Math expression') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.math-evaluator.cardInputDescription',
                'Enter a math expression using standard operators and functions (e.g. 2 * sqrt(6) + sin(pi / 4)).',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup class="space-y-3">
          <Field>
            <FieldContent class="space-y-2">
              <Textarea
                v-model="expression"
                :placeholder="t('tools.math-evaluator.placeholder', 'Your math expression (ex: 2*sqrt(6) )...')"
                class="max-h-48 resize-y overflow-y-auto font-mono text-sm"
                rows="3"
                spellcheck="false"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                autofocus
              />
              <div class="flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  :disabled="expression.length === 0"
                  @click="clearExpression"
                >
                  <X class="mr-2 h-4 w-4" />
                  {{ t('common.clear', 'Clear') }}
                </Button>
              </div>
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card v-if="hasResult" class="gap-2">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Calculator class="h-5 w-5 text-primary" />
            {{ t('tools.math-evaluator.cardResultTitle', 'Evaluation result') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.math-evaluator.cardResultDescription',
                'The evaluated result of your expression.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div
          class="rounded-md border bg-muted/50 px-4 py-3 font-mono text-lg break-all"
          data-test-id="math-result"
        >
          {{ String(result) }}
        </div>
      </CardContent>
    </Card>
  </div>
</template>
