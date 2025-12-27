<script setup lang="ts">
import { X } from 'lucide-vue-next';
import InputCopyable from '@/components/InputCopyable.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToolI18n } from '@/composable/useToolI18n';
import { textToBase64 } from '@/utils/base64';

const username = ref('')
const password = ref('')
const header = computed(() => {
  if (!username.value && !password.value) { return '' }
  return `Authorization: Basic ${textToBase64(`${username.value}:${password.value}`)}`
});

const { t } = useToolI18n();

function clearInput() {
  username.value = ''
  password.value = ''
}
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Input -->
    <Card class="flex flex-col">
      <CardHeader class="pb-3">
        <div class="space-y-1">
          <CardTitle>{{ t('tools.basic-auth-generator.inputTitle', 'Credentials') }}</CardTitle>
          <CardDescription>
            {{ t('tools.basic-auth-generator.inputDescription', 'Enter your username and password to generate a Basic Authentication header.') }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent class="flex flex-1 flex-col gap-6">
        <FieldSet>
          <Field orientation="vertical" class="gap-3">
            <FieldLabel class="text-sm font-medium">
              {{ t('tools.basic-auth-generator.username', 'Username') }}
            </FieldLabel>
            <FieldContent>
              <Input
                v-model="username"
                :placeholder="t('tools.basic-auth-generator.usernamePlaceholder', 'Your username...')"
                class="w-full"
              />
            </FieldContent>
          </Field>

          <Field orientation="vertical" class="gap-3">
            <FieldLabel class="text-sm font-medium">
              {{ t('tools.basic-auth-generator.password', 'Password') }}
            </FieldLabel>
            <FieldContent>
              <Input
                v-model="password"
                :placeholder="t('tools.basic-auth-generator.passwordPlaceholder', 'Your password...')"
                type="password"
                class="w-full"
              />
            </FieldContent>
          </Field>
        </FieldSet>

        <Separator />

        <div class="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" @click="clearInput">
            <X class="mr-2 h-4 w-4" />
            {{ t('common.clear', 'Clear') }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Output -->
    <Card class="flex flex-col">
      <CardHeader class="pb-3">
        <div class="space-y-1">
          <CardTitle>{{ t('tools.basic-auth-generator.outputTitle', 'Authorization Header') }}</CardTitle>
          <CardDescription>
            {{ t('tools.basic-auth-generator.outputDescription', 'The generated Basic Authentication header ready to use in your HTTP requests.') }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent class="flex flex-1 flex-col gap-6">
        <Field orientation="vertical">
          <FieldLabel>{{ t('tools.basic-auth-generator.headerLabel', 'Authorization header') }}</FieldLabel>
          <FieldContent>
            <InputCopyable
              :value="header"
              :placeholder="t('tools.basic-auth-generator.headerPlaceholder', 'Authorization header will appear here...')"
              :field-props="{ orientation: 'vertical' }"
              readonly
            />
          </FieldContent>
        </Field>

        <template v-if="header">
          <Separator />
          <div class="rounded-md border bg-muted/30 p-3">
            <div class="text-xs text-muted-foreground mb-1">
              {{ t('tools.basic-auth-generator.base64Value', 'Base64 Encoded Value') }}
            </div>
            <div class="text-sm font-mono break-all">
              {{ header.replace('Authorization: Basic ', '') }}
            </div>
          </div>
        </template>
      </CardContent>
    </Card>
  </div>
</template>
