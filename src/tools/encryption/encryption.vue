<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { AES, enc, Rabbit, RC4, TripleDES } from 'crypto-js'
import { Lock, Unlock } from 'lucide-vue-next';

import InputCopyable from '@/components/InputCopyable.vue';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { computedCatch } from '@/composable/computed/catchedComputed';
import { useToolI18n } from '@/composable/useToolI18n';

const algos = { AES, TripleDES, Rabbit, RC4 };
const algoKeys = Object.keys(algos) as (keyof typeof algos)[];

const { t } = useToolI18n();

const cypherInput = ref('Lorem ipsum dolor sit amet');
const cypherAlgo = useStorage<keyof typeof algos>('encryption:cypher-algo', 'AES');
const cypherSecret = ref('my secret key');
const cypherOutput = computed(() => algos[cypherAlgo.value].encrypt(cypherInput.value, cypherSecret.value).toString());

const decryptInput = ref('U2FsdGVkX1/EC3+6P5dbbkZ3e1kQ5o2yzuU0NHTjmrKnLBEwreV489Kr0DIB+uBs');
const decryptAlgo = useStorage<keyof typeof algos>('encryption:decrypt-algo', 'AES');
const decryptSecret = ref('my secret key');
const [decryptOutput, decryptError] = computedCatch(
  () => algos[decryptAlgo.value].decrypt(decryptInput.value, decryptSecret.value).toString(enc.Utf8),
  {
    defaultValue: '',
    defaultErrorMessage: t('tools.encryption.unableToDecrypt'),
  },
);
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Encrypt -->
    <Card class="flex flex-col">
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center gap-2">
          <Lock class="h-5 w-5 text-primary" />
          {{ t('tools.encryption.encrypt') }}
        </CardTitle>
      </CardHeader>
      <CardContent class="flex flex-1 flex-col gap-6">
        <FieldGroup>
          <Field orientation="vertical">
            <FieldLabel for="encrypt-input">
              {{ t('tools.encryption.yourText') }}
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="encrypt-input"
                v-model="cypherInput"
                :placeholder="t('tools.encryption.stringToCypher')"
                rows="4"
                class="min-h-28 font-mono"
              />
            </FieldContent>
          </Field>

          <Field orientation="vertical">
            <FieldLabel for="encrypt-secret">
              {{ t('tools.encryption.yourSecretKey') }}
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="encrypt-secret"
                v-model="cypherSecret"
                :placeholder="t('tools.encryption.yourSecretKey')"
                rows="2"
                class="min-h-16 font-mono"
              />
            </FieldContent>
          </Field>

          <Separator />

          <FieldSet>
            <FieldLabel>{{ t('tools.encryption.encryptionAlgorithm') }}</FieldLabel>
            <FieldDescription>
              {{ t('tools.encryption.encryptionAlgorithm') }}
            </FieldDescription>
            <RadioGroup v-model="cypherAlgo" class="grid grid-cols-2 gap-3">
              <FieldLabel v-for="algo in algoKeys" :key="algo" :for="`encrypt-${algo}`" class="cursor-pointer hover:bg-accent/50">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{{ algo }}</FieldTitle>
                  </FieldContent>
                  <RadioGroupItem :id="`encrypt-${algo}`" :value="algo" />
                </Field>
              </FieldLabel>
            </RadioGroup>
          </FieldSet>
        </FieldGroup>

        <Separator />

        <Field orientation="vertical">
          <FieldLabel for="encrypt-output">
            {{ t('tools.encryption.yourTextEncrypted') }}
          </FieldLabel>
          <FieldContent>
            <InputCopyable
              id="encrypt-output"
              :value="cypherOutput"
              :placeholder="t('tools.encryption.stringHash')"
              readonly
              :field-props="{
                orientation: 'vertical',
              }"
            />
          </FieldContent>
        </Field>
      </CardContent>
    </Card>

    <!-- Decrypt -->
    <Card class="flex flex-col">
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center gap-2">
          <Unlock class="h-5 w-5 text-primary" />
          {{ t('tools.encryption.decrypt') }}
        </CardTitle>
      </CardHeader>
      <CardContent class="flex flex-1 flex-col gap-6">
        <FieldGroup>
          <Field orientation="vertical">
            <FieldLabel for="decrypt-input">
              {{ t('tools.encryption.yourEncryptedText') }}
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="decrypt-input"
                v-model="decryptInput"
                :placeholder="t('tools.encryption.stringToCypher')"
                rows="4"
                class="min-h-28 font-mono"
              />
            </FieldContent>
          </Field>

          <Field orientation="vertical">
            <FieldLabel for="decrypt-secret">
              {{ t('tools.encryption.yourSecretKey') }}
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="decrypt-secret"
                v-model="decryptSecret"
                :placeholder="t('tools.encryption.yourSecretKey')"
                rows="2"
                class="min-h-16 font-mono"
              />
            </FieldContent>
          </Field>

          <Separator />

          <FieldSet>
            <FieldLabel>{{ t('tools.encryption.encryptionAlgorithm') }}</FieldLabel>
            <FieldDescription>
              {{ t('tools.encryption.encryptionAlgorithm') }}
            </FieldDescription>
            <RadioGroup v-model="decryptAlgo" class="grid grid-cols-2 gap-3">
              <FieldLabel v-for="algo in algoKeys" :key="algo" :for="`decrypt-${algo}`" class="cursor-pointer hover:bg-accent/50">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{{ algo }}</FieldTitle>
                  </FieldContent>
                  <RadioGroupItem :id="`decrypt-${algo}`" :value="algo" />
                </Field>
              </FieldLabel>
            </RadioGroup>
          </FieldSet>
        </FieldGroup>

        <Separator />

        <Alert v-if="decryptError" variant="destructive">
          <AlertTitle>{{ t('tools.encryption.errorWhileDecrypting') }}</AlertTitle>
          <p class="text-sm">
            {{ decryptError }}
          </p>
        </Alert>
        <Field v-else orientation="vertical">
          <FieldLabel for="decrypt-output">
            {{ t('tools.encryption.yourDecryptedText') }}
          </FieldLabel>
          <FieldContent>
            <InputCopyable
              id="decrypt-output"
              :value="decryptOutput"
              :placeholder="t('tools.encryption.stringHash')"
              readonly
              :field-props="{
                orientation: 'vertical',
              }"
            />
          </FieldContent>
        </Field>
      </CardContent>
    </Card>
  </div>
</template>
