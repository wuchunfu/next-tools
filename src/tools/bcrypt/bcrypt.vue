<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { compareSync, hashSync } from 'bcryptjs';
import { CheckCircle2, Lock, XCircle } from 'lucide-vue-next';
import InputCopyable from '@/components/InputCopyable.vue';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToolI18n } from '@/composable/useToolI18n';

const { t } = useToolI18n()
const input = ref('')
const saltCount = useStorage('bcrypt:salt-count', 10)

// Slider requires array, so we create a computed for it
const saltCountArray = computed({
  get: () => [saltCount.value],
  set: (value: number[]) => {
    saltCount.value = value[0] ?? 10
  },
})

const hashed = computed(() => {
  if (!input.value.trim()) { return '' }
  return hashSync(input.value, saltCount.value)
});

const compareString = ref('')
const compareHash = ref('')
const compareMatch = computed(() => {
  if (!compareString.value.trim() || !compareHash.value.trim()) { return null }
  try {
    return compareSync(compareString.value, compareHash.value)
  }
  catch {
    return false
  }
})
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Hash Section -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Lock class="h-5 w-5 text-primary" />
          {{ t('tools.bcrypt.hash') }}
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <FieldGroup>
          <Field orientation="responsive">
            <FieldLabel for="bcrypt-input" class="w-32 text-right sm:text-right">
              {{ t('tools.bcrypt.yourString') }}
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="bcrypt-input"
                v-model="input"
                :placeholder="t('tools.bcrypt.placeholder')"
                rows="3"
                class="min-h-20 font-mono"
                autofocus
              />
            </FieldContent>
          </Field>

          <Separator />

          <Field orientation="responsive">
            <FieldLabel for="bcrypt-salt" class="w-32 text-right sm:text-right">
              {{ t('tools.bcrypt.saltCount') }}
            </FieldLabel>
            <FieldContent class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">{{ t('tools.bcrypt.saltCount') }}</span>
                <span class="text-lg font-semibold">{{ saltCount }}</span>
              </div>
              <Slider
                id="bcrypt-salt"
                v-model="saltCountArray"
                :min="4"
                :max="31"
                :step="1"
                class="w-full"
              />
              <div class="flex justify-between text-xs text-muted-foreground">
                <span>4</span>
                <span>31</span>
              </div>
            </FieldContent>
          </Field>

          <Separator />

          <Field orientation="responsive">
            <FieldLabel class="w-32 text-right sm:text-right">
              {{ t('tools.bcrypt.hash') }}
            </FieldLabel>
            <FieldContent>
              <InputCopyable
                :value="hashed"
                :placeholder="t('tools.bcrypt.placeholder')"
                readonly
                :field-props="{
                  orientation: 'horizontal',
                }"
              />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <!-- Compare Section -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <CheckCircle2 class="h-5 w-5 text-primary" />
          {{ t('tools.bcrypt.compareStringWithHash') }}
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <FieldGroup>
          <Field orientation="responsive">
            <FieldLabel for="compare-string" class="w-32 text-right sm:text-right">
              {{ t('tools.bcrypt.yourString') }}
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="compare-string"
                v-model="compareString"
                :placeholder="t('tools.bcrypt.stringToCompare')"
                rows="3"
                class="min-h-20 font-mono"
              />
            </FieldContent>
          </Field>

          <Field orientation="responsive">
            <FieldLabel for="compare-hash" class="w-32 text-right sm:text-right">
              {{ t('tools.bcrypt.yourHash') }}
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="compare-hash"
                v-model="compareHash"
                :placeholder="t('tools.bcrypt.hashToCompare')"
                rows="3"
                class="min-h-20 font-mono"
              />
            </FieldContent>
          </Field>

          <Separator />

          <Field orientation="responsive">
            <FieldLabel class="w-32 text-right sm:text-right">
              {{ t('tools.bcrypt.doTheyMatch') }}
            </FieldLabel>
            <FieldContent>
              <Alert v-if="compareMatch === true" class="border-green-500/50 bg-green-500/10">
                <CheckCircle2 class="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle class="text-green-600 dark:text-green-400">
                  {{ t('tools.bcrypt.yes') }}
                </AlertTitle>
              </Alert>
              <Alert v-else-if="compareMatch === false" variant="destructive">
                <XCircle class="h-4 w-4" />
                <AlertTitle>
                  {{ t('tools.bcrypt.no') }}
                </AlertTitle>
              </Alert>
              <Alert v-else class="border-muted">
                <AlertTitle class="text-muted-foreground">
                  {{ t('tools.bcrypt.enterBothFields', 'Enter both fields to compare') }}
                </AlertTitle>
              </Alert>
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
</template>
