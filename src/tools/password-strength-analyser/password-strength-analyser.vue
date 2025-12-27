<script setup lang="ts">
import { Shield } from 'lucide-vue-next';
import { computed, ref } from 'vue';

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useToolI18n } from '@/composable/useToolI18n';
import { getPasswordCrackTimeEstimation } from './password-strength-analyser.service';

const { t, locale: _locale } = useToolI18n();
const password = ref('');
const crackTimeEstimation = computed(() => getPasswordCrackTimeEstimation({ password: password.value }));

// Computed for formatted duration with current locale
const crackDurationFormatted = computed(() =>
  crackTimeEstimation.value.getFormattedDuration(t),
)

const details = computed(() => [
  {
    label: t('tools.password-strength-analyser.passwordLength'),
    value: crackTimeEstimation.value.passwordLength,
  },
  {
    label: t('tools.password-strength-analyser.entropy'),
    value: Math.round(crackTimeEstimation.value.entropy * 100) / 100,
  },
  {
    label: t('tools.password-strength-analyser.charsetLength'),
    value: crackTimeEstimation.value.charsetLength,
  },
  {
    label: t('tools.password-strength-analyser.score'),
    value: `${Math.round(crackTimeEstimation.value.score * 100)} / 100`,
  },
]);
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Input -->
    <Card class="flex flex-col">
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center gap-2">
          <Shield class="h-5 w-5 text-primary" />
          {{ t('tools.password-strength-analyser.cardInputTitle', 'Password input') }}
        </CardTitle>
      </CardHeader>
      <CardContent class="flex-1 space-y-4">
        <FieldGroup>
          <Field orientation="vertical">
            <FieldLabel for="password-input">
              {{ t('tools.password-strength-analyser.inputPlaceholder') }}
            </FieldLabel>
            <FieldContent>
              <Input
                id="password-input"
                v-model="password"
                type="password"
                :placeholder="t('tools.password-strength-analyser.inputPlaceholder')"
                class="font-mono"
                autofocus
              />
            </FieldContent>
            <FieldDescription>
              {{ t('tools.password-strength-analyser.noteDescription') }}
            </FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <!-- Result -->
    <Card class="flex flex-col">
      <CardHeader class="pb-3">
        <CardTitle>{{ t('tools.password-strength-analyser.cardResultTitle', 'Crack time estimation') }}</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-1 flex-col gap-4">
        <div class="flex flex-col items-center justify-center rounded-lg border bg-muted/40 px-4 py-6 text-center">
          <p class="text-sm text-muted-foreground">
            {{ t('tools.password-strength-analyser.durationToCrack') }}
          </p>
          <p class="text-3xl font-semibold tracking-tight" data-test-id="crack-duration">
            {{ crackDurationFormatted }}
          </p>
          <Badge variant="secondary" class="mt-3">
            {{ t('tools.password-strength-analyser.score') }} {{ Math.round(crackTimeEstimation.score * 100) / 100 }}
          </Badge>
        </div>

        <Separator />

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            v-for="({ label, value }) of details"
            :key="label"
            class="rounded-lg border bg-card p-3"
          >
            <Field orientation="vertical">
              <FieldLabel class="text-xs text-muted-foreground">
                {{ label }}
              </FieldLabel>
              <FieldContent>
                <FieldTitle class="text-lg font-semibold">
                  {{ value }}
                </FieldTitle>
              </FieldContent>
            </Field>
          </div>
        </div>

        <Separator />

        <div class="text-sm text-muted-foreground">
          <span class="font-semibold text-foreground">{{ t('tools.password-strength-analyser.note') }}: </span>
          {{ t('tools.password-strength-analyser.noteDescription') }}
        </div>
      </CardContent>
    </Card>
  </div>
</template>
