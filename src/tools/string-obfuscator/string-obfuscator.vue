<script setup lang="ts">
import { EyeOff, Key } from 'lucide-vue-next';
import TextareaCopyable from '@/components/TextareaCopyable.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch'
import { useToolI18n } from '@/composable/useToolI18n';
import { useObfuscateString } from './string-obfuscator.model'

const str = ref('Lorem ipsum dolor sit amet')
const keepFirst = ref(4)
const keepLast = ref(4)
const keepSpace = ref(true)

const obfuscatedString = useObfuscateString(str, { keepFirst, keepLast, keepSpace })

const { t } = useToolI18n();
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <Card>
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Key class="h-5 w-5 text-primary" />
            {{ t('tools.string-obfuscator.cardInputTitle') }}
          </CardTitle>
          <CardDescription>{{ t('tools.string-obfuscator.cardInputDescription') }}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel for="obfuscate-input">
              {{ t('tools.string-obfuscator.label') }}
            </FieldLabel>
            <FieldContent>
              <Input
                id="obfuscate-input"
                v-model="str"
                :placeholder="t('tools.string-obfuscator.placeholder')"
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel for="keep-first">
              {{ t('tools.string-obfuscator.keepFirst') }}
            </FieldLabel>
            <FieldContent>
              <Input
                id="keep-first"
                v-model.number="keepFirst"
                type="number"
                min="0"
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel for="keep-last">
              {{ t('tools.string-obfuscator.keepLast') }}
            </FieldLabel>
            <FieldContent>
              <Input
                id="keep-last"
                v-model.number="keepLast"
                type="number"
                min="0"
              />
            </FieldContent>
          </Field>

          <Field orientation="responsive">
            <FieldLabel for="keep-space">
              {{ t('tools.string-obfuscator.keepSpaces') }}
            </FieldLabel>
            <FieldContent>
              <Switch id="keep-space" v-model="keepSpace" />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <EyeOff class="h-5 w-5 text-primary" />
            {{ t('tools.string-obfuscator.cardResultsTitle') }}
          </CardTitle>
          <CardDescription>{{ t('tools.string-obfuscator.cardResultsDescription') }}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <TextareaCopyable :value="obfuscatedString" copy-placement="top-right" />
      </CardContent>
    </Card>
  </div>
</template>
