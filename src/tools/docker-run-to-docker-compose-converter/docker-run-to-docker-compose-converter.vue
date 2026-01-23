<script setup lang="ts">
import { composerize, MessageType } from 'composerize-ts';
import { AlertTriangle, Download, FileCode2, Info, Terminal, X } from 'lucide-vue-next'
import TextareaCopyable from '@/components/TextareaCopyable.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldLabel, FieldSet } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useDownloadFileFromBase64 } from '@/composable/downloadBase64'
import { useToolI18n } from '@/composable/useToolI18n'
import { textToBase64 } from '@/utils/base64'
import { withDefaultOnError } from '@/utils/defaults'

const dockerRun = ref(
  'docker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx',
);
const { t } = useToolI18n();

const conversionResult = computed(() =>
  withDefaultOnError(() => composerize(dockerRun.value.trim()), { yaml: '', messages: [] }),
);
const dockerCompose = computed(() => conversionResult.value.yaml);
const notImplemented = computed(() =>
  conversionResult.value.messages.filter(msg => msg.type === MessageType.notImplemented).map(msg => msg.value),
);
const notComposable = computed(() =>
  conversionResult.value.messages.filter(msg => msg.type === MessageType.notTranslatable).map(msg => msg.value),
);
const errors = computed(() =>
  conversionResult.value.messages
    .filter(msg => msg.type === MessageType.errorDuringConversion)
    .map(msg => msg.value),
);
const dockerComposeBase64 = computed(() => `data:application/yaml;base64,${textToBase64(dockerCompose.value)}`);
const { download } = useDownloadFileFromBase64({ source: dockerComposeBase64, filename: 'docker-compose.yml' });

function clearInput() {
  dockerRun.value = '';
}
</script>

<template>
  <div class="space-y-6">
    <Card>
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Terminal class="h-5 w-5 text-primary" />
            {{ t('tools.docker-run-to-compose.cardInputTitle', 'Docker run command') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.docker-run-to-compose.cardInputDescription',
                'Paste your docker run command below to convert it to a docker-compose.yml service definition.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <FieldSet>
          <Field orientation="vertical" class="gap-3">
            <div class="flex items-center justify-between">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.docker-run-to-compose.inputLabel') }}
              </FieldLabel>
              <div class="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" :disabled="!dockerRun" @click="clearInput">
                  <X class="mr-2 h-4 w-4" />
                  {{ t('common.clear', 'Clear command') }}
                </Button>
              </div>
            </div>
            <FieldContent>
              <Textarea
                v-model="dockerRun"
                :placeholder="t('tools.docker-run-to-compose.inputPlaceholder')"
                rows="4"
                class="max-h-96 resize-y overflow-y-auto font-mono text-sm break-all"
              />
            </FieldContent>
          </Field>
        </FieldSet>
      </CardContent>
    </Card>

    <Card class="space-y-2">
      <CardHeader class="pb-3">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileCode2 class="h-5 w-5 text-primary" />
            {{ t('tools.docker-run-to-compose.cardOutputTitle', 'Generated docker-compose.yml') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.docker-run-to-compose.cardOutputDescription',
                'Review, copy, or download the generated docker-compose configuration.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <TextareaCopyable
          :value="dockerCompose"
          language="yaml"
          copy-placement="top-right"
          class="min-h-20"
        />

        <div class="flex justify-end">
          <Button
            :disabled="dockerCompose === ''"
            class="gap-2"
            @click="download"
          >
            <Download class="h-4 w-4" />
            {{ t('tools.docker-run-to-compose.download') }}
          </Button>
        </div>

        <Separator v-if="notComposable.length || notImplemented.length || errors.length" />

        <div class="space-y-3">
          <Alert
            v-if="notComposable.length > 0"
            class="border-blue-500/40 bg-blue-500/10"
          >
            <Info class="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle class="text-blue-700 dark:text-blue-300">
              {{ t('tools.docker-run-to-compose.notComposableTitle') }}
            </AlertTitle>
            <AlertDescription class="text-xs text-blue-800/80 dark:text-blue-200/80">
              <ul class="list-disc space-y-1 pl-4">
                <li v-for="(message, index) of notComposable" :key="`not-composable-${index}`">
                  {{ message }}
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert
            v-if="notImplemented.length > 0"
            class="border-amber-500/40 bg-amber-500/10"
          >
            <AlertTriangle class="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle class="text-amber-700 dark:text-amber-300">
              {{ t('tools.docker-run-to-compose.notImplementedTitle') }}
            </AlertTitle>
            <AlertDescription class="text-xs text-amber-800/80 dark:text-amber-200/80">
              <ul class="list-disc space-y-1 pl-4">
                <li v-for="(message, index) of notImplemented" :key="`not-implemented-${index}`">
                  {{ message }}
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert
            v-if="errors.length > 0"
            variant="destructive"
            class="border-destructive/50 bg-destructive/10"
          >
            <AlertTriangle class="h-4 w-4" />
            <AlertTitle>
              {{ t('tools.docker-run-to-compose.errorsTitle') }}
            </AlertTitle>
            <AlertDescription class="text-xs">
              <ul class="list-disc space-y-1 pl-4">
                <li v-for="(message, index) of errors" :key="`error-${index}`">
                  {{ message }}
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
