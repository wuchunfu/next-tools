<script setup lang="ts">
import type { lib } from 'crypto-js'
import { useStorage } from '@vueuse/core'
import {
  enc,
  HmacMD5,
  HmacRIPEMD160,
  HmacSHA1,
  HmacSHA3,
  HmacSHA224,
  HmacSHA256,
  HmacSHA384,
  HmacSHA512,
} from 'crypto-js'
import { Lock, ShieldCheck } from 'lucide-vue-next'
import { computed, ref } from 'vue'

import InputCopyable from '@/components/InputCopyable.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useToolI18n } from '@/composable/useToolI18n'
import { convertHexToBin } from '../hash-text/hash-text.service'

const algos = {
  MD5: HmacMD5,
  RIPEMD160: HmacRIPEMD160,
  SHA1: HmacSHA1,
  SHA3: HmacSHA3,
  SHA224: HmacSHA224,
  SHA256: HmacSHA256,
  SHA384: HmacSHA384,
  SHA512: HmacSHA512,
} as const;

type Encoding = keyof typeof enc | 'Bin'

function formatWithEncoding(words: lib.WordArray, encoding: Encoding) {
  if (encoding === 'Bin') {
    return convertHexToBin(words.toString(enc.Hex));
  }
  return words.toString(enc[encoding]);
}

const plainText = ref('');
const secret = ref('');
const hashFunction = useStorage<keyof typeof algos>('hmac:hash-function', 'SHA256');
const encoding = useStorage<Encoding>('hmac:encoding', 'Hex');
const { t } = useToolI18n();

const hmac = computed(() =>
  formatWithEncoding(algos[hashFunction.value](plainText.value, secret.value), encoding.value),
);

const plainLength = computed(() => plainText.value.length);
const secretLength = computed(() => secret.value.length);
const outputLength = computed(() => hmac.value.length);
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Input Section -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Lock class="h-5 w-5 text-primary" />
          {{ t('tools.hmac-generator.cardInputTitle') }}
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <FieldGroup>
          <Field orientation="responsive">
            <FieldLabel for="hmac-plain" class="w-32 text-right sm:text-right">
              {{ t('tools.hmac-generator.plainLabel') }}
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="hmac-plain"
                v-model="plainText"
                :placeholder="t('tools.hmac-generator.plainPlaceholder')"
                rows="3"
                class="min-h-20 font-mono"
                autofocus
              />
            </FieldContent>
          </Field>

          <Field orientation="responsive">
            <FieldLabel for="hmac-secret" class="w-32 text-right sm:text-right">
              {{ t('tools.hmac-generator.secretLabel') }}
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="hmac-secret"
                v-model="secret"
                :placeholder="t('tools.hmac-generator.secretPlaceholder')"
                rows="2"
                class="min-h-16 font-mono"
              />
            </FieldContent>
          </Field>

          <Separator />

          <FieldSet>
            <FieldLabel>{{ t('tools.hmac-generator.hashFunction') }}</FieldLabel>
            <RadioGroup v-model="hashFunction" class="grid grid-cols-2 gap-3">
              <FieldLabel v-for="algo in Object.keys(algos)" :key="algo" class="cursor-pointer hover:bg-accent/50">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{{ algo }}</FieldTitle>
                  </FieldContent>
                  <RadioGroupItem :value="algo" />
                </Field>
              </FieldLabel>
            </RadioGroup>
          </FieldSet>

          <FieldSet>
            <FieldLabel>{{ t('tools.hmac-generator.encoding') }}</FieldLabel>
            <RadioGroup v-model="encoding" class="grid grid-cols-2 gap-3">
              <FieldLabel class="cursor-pointer hover:bg-accent/50">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{{ t('tools.hmac-generator.binary') }}</FieldTitle>
                    <FieldDescription>Base 2</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value="Bin" />
                </Field>
              </FieldLabel>
              <FieldLabel class="cursor-pointer hover:bg-accent/50">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{{ t('tools.hmac-generator.hex') }}</FieldTitle>
                    <FieldDescription>Base 16</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value="Hex" />
                </Field>
              </FieldLabel>
              <FieldLabel class="cursor-pointer hover:bg-accent/50">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{{ t('tools.hmac-generator.base64') }}</FieldTitle>
                  </FieldContent>
                  <RadioGroupItem value="Base64" />
                </Field>
              </FieldLabel>
              <FieldLabel class="cursor-pointer hover:bg-accent/50">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{{ t('tools.hmac-generator.base64url') }}</FieldTitle>
                  </FieldContent>
                  <RadioGroupItem value="Base64url" />
                </Field>
              </FieldLabel>
            </RadioGroup>
          </FieldSet>
        </FieldGroup>
      </CardContent>
    </Card>

    <!-- Output Section -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <ShieldCheck class="h-5 w-5 text-primary" />
          {{ t('tools.hmac-generator.cardOutputTitle') }}
        </CardTitle>
      </CardHeader>
      <CardContent class="flex flex-1 flex-col gap-4 overflow-hidden">
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium">
            {{ t('tools.hmac-generator.hashFunction') }}: {{ hashFunction }}
          </span>
          <span class="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium">
            {{ t('tools.hmac-generator.encoding') }}: {{ encoding }}
          </span>
        </div>

        <div class="grid grid-cols-3 gap-3 rounded-lg border p-3 text-sm">
          <div class="space-y-1">
            <p class="text-muted-foreground">
              {{ t('tools.hmac-generator.plainLabel') }}
            </p>
            <p class="font-medium">
              {{ plainLength }}
            </p>
          </div>
          <div class="space-y-1">
            <p class="text-muted-foreground">
              {{ t('tools.hmac-generator.secretLabel') }}
            </p>
            <p class="font-medium">
              {{ secretLength }}
            </p>
          </div>
          <div class="space-y-1">
            <p class="text-muted-foreground">
              {{ t('tools.hmac-generator.resultLabel') }}
            </p>
            <p class="font-medium">
              {{ outputLength }}
            </p>
          </div>
        </div>

        <InputCopyable
          :value="hmac"
          :placeholder="t('tools.hmac-generator.resultPlaceholder')"
          readonly
          :field-props="{
            orientation: 'vertical',
            class: 'h-full',
          }"
          :label-props="{
            class: 'text-sm text-muted-foreground',
          }"
        />
      </CardContent>
    </Card>
  </div>
</template>
