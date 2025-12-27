<script setup lang="ts">
import type { lib } from 'crypto-js';
import { enc, MD5, RIPEMD160, SHA1, SHA3, SHA224, SHA256, SHA384, SHA512 } from 'crypto-js';
import { Hash } from 'lucide-vue-next';

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
import { useQueryParam } from '@/composable/queryParams'
import { useToolI18n } from '@/composable/useToolI18n'
import InputCopyable from '../../components/InputCopyable.vue'
import { convertHexToBin } from './hash-text.service'

const algos = {
  MD5,
  SHA1,
  SHA256,
  SHA224,
  SHA512,
  SHA384,
  SHA3,
  RIPEMD160,
} as const;

type AlgoNames = keyof typeof algos
type Encoding = keyof typeof enc | 'Bin'
const { t } = useToolI18n();
const algoNames = Object.keys(algos) as AlgoNames[];
const encoding = useQueryParam<Encoding>({ defaultValue: 'Hex', name: 'encoding' });
const clearText = ref('');

function formatWithEncoding(words: lib.WordArray, encoding: Encoding) {
  if (encoding === 'Bin') {
    return convertHexToBin(words.toString(enc.Hex));
  }

  return words.toString(enc[encoding]);
}

const hashText = (algo: AlgoNames, value: string) => formatWithEncoding(algos[algo](value), encoding.value);

const hasInput = computed(() => clearText.value.trim().length > 0);
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card>
      <CardHeader>
        <CardTitle>{{ t('tools.hash-text.cardInputTitle') }}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-6 px-6">
        <FieldGroup>
          <Field orientation="vertical">
            <FieldLabel for="hash-input">
              {{ t('tools.hash-text.yourTextToHash') }}
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="hash-input"
                v-model="clearText"
                :placeholder="t('tools.hash-text.placeholder')"
                rows="4"
                class="min-h-28 font-mono"
                autofocus
              />
            </FieldContent>
          </Field>
        </FieldGroup>

        <Separator />

        <FieldSet>
          <FieldLabel for="encoding-hex">
            {{ t('tools.hash-text.digestEncoding') }}
          </FieldLabel>
          <FieldDescription>
            {{ t('tools.hash-text.digestEncodingDescription') }}
          </FieldDescription>
          <RadioGroup v-model="encoding" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FieldLabel for="encoding-hex" class="cursor-pointer hover:bg-accent/50">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>{{ t('tools.hash-text.hexadecimal') }}</FieldTitle>
                  <FieldDescription>
                    {{ t('tools.hash-text.hexadecimalDescription') }}
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem id="encoding-hex" value="Hex" />
              </Field>
            </FieldLabel>
            <FieldLabel for="encoding-base64" class="cursor-pointer hover:bg-accent/50">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>{{ t('tools.hash-text.base64') }}</FieldTitle>
                  <FieldDescription>
                    {{ t('tools.hash-text.base64Description') }}
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem id="encoding-base64" value="Base64" />
              </Field>
            </FieldLabel>
            <FieldLabel for="encoding-base64url" class="cursor-pointer hover:bg-accent/50">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>{{ t('tools.hash-text.base64url') }}</FieldTitle>
                  <FieldDescription>
                    {{ t('tools.hash-text.base64urlDescription') }}
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem id="encoding-base64url" value="Base64url" />
              </Field>
            </FieldLabel>
            <FieldLabel for="encoding-bin" class="cursor-pointer hover:bg-accent/50">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>{{ t('tools.hash-text.binary') }}</FieldTitle>
                  <FieldDescription>
                    {{ t('tools.hash-text.binaryDescription') }}
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem id="encoding-bin" value="Bin" />
              </Field>
            </FieldLabel>
          </RadioGroup>
        </FieldSet>
      </CardContent>
    </Card>

    <Card v-if="hasInput">
      <CardHeader>
        <CardTitle>{{ t('tools.hash-text.cardOutputTitle') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="algo in algoNames"
            :key="algo"
            class="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
          >
            <InputCopyable
              :value="hashText(algo, clearText)"
              :label="algo"
              readonly
              :field-props="{
                orientation: 'vertical',
              }"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card v-else class="border-dashed">
      <CardContent class="flex flex-col items-center justify-center py-12 text-center">
        <Hash class="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p class="text-sm text-muted-foreground">
          {{ t('tools.hash-text.noInput') }}
        </p>
      </CardContent>
    </Card>
  </div>
</template>
