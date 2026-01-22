<script setup lang="ts">
import { CornerDownRight, Link2, X } from 'lucide-vue-next'
import InputCopyable from '@/components/InputCopyable.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToolI18n } from '@/composable/useToolI18n';
import { useValidation } from '@/composable/validation';
import { extractUrlProperties, isValidUrl, parseSearchParams, parseUrl  } from './url-parser.service';
import type {UrlProperty} from './url-parser.service';

const { t } = useToolI18n()

const urlToParse = ref('')

const urlParsed = computed(() => parseUrl(urlToParse.value))

const urlValidation = useValidation({
  source: urlToParse,
  rules: computed(() => [
    {
      validator: (value: string) => isValidUrl(value),
      message: t('tools.url-parser.invalid', 'Invalid URL'),
    },
  ]),
})

const properties = computed(() => {
  if (!urlParsed.value) { return [] }
  
  const allProperties: UrlProperty[] = [
    { title: t('tools.url-parser.protocol'), key: 'protocol' },
    { title: t('tools.url-parser.username'), key: 'username' },
    { title: t('tools.url-parser.password'), key: 'password' },
    { title: t('tools.url-parser.hostname'), key: 'hostname' },
    { title: t('tools.url-parser.port'), key: 'port' },
    { title: t('tools.url-parser.path'), key: 'pathname' },
    { title: t('tools.url-parser.hash'), key: 'hash' },
  ]
  
  return extractUrlProperties(urlParsed.value, allProperties)
})

const searchParams = computed(() => {
  if (!urlParsed.value) { return [] }
  return parseSearchParams(urlParsed.value)
})

function clearInput() {
  urlToParse.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="gap-2" data-testid="input-card">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Link2 class="h-5 w-5 text-primary" />
            {{ t('tools.url-parser.cardInputTitle', 'URL input') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.url-parser.cardInputDescription',
                'Paste a URL below. We will validate it and show its components and query parameters.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent class="space-y-2">
        <Input
          v-model="urlToParse"
          data-testid="url-input"
          :placeholder="t('tools.url-parser.inputPlaceholder', 'Enter the URL to parse...')"
          :class="{ 'border-destructive': urlValidation.status === 'error' }"
        />
        <div class="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" data-testid="clear-btn" @click="clearInput">
            <X class="mr-2 h-4 w-4" />
            {{ t('common.clear', 'Clear') }}
          </Button>
        </div>
        <Alert
          v-if="urlValidation.status === 'error'"
          variant="destructive"
          class="border-destructive/40 bg-destructive/10"
          data-testid="error-alert"
        >
          <AlertTitle class="text-sm">
            {{ t('tools.url-parser.invalidUrlTitle', 'Invalid URL') || t('tools.url-parser.invalid', 'Invalid URL') }}
          </AlertTitle>
          <AlertDescription class="text-xs">
            {{ urlValidation.message }}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>

    <Card v-if="urlParsed" class="gap-2" data-testid="output-card">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Link2 class="h-5 w-5 text-primary" />
            {{ t('tools.url-parser.cardOutputTitle', 'Parsed result') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.url-parser.cardOutputDescription',
                'Review and copy the URL components extracted from your input.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-3" data-testid="url-components-section">
          <h3 class="text-sm font-medium">
            {{ t('tools.url-parser.urlComponents', 'URL Components') }}
          </h3>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InputCopyable
              v-for="{ title, key } in properties"
              :key="key"
              :data-testid="`component-${key}`"
              :label="title"
              :value="(urlParsed[key] as string) || ''"
              readonly
              :field-props="{ orientation: 'vertical' }"
              placeholder=" "
            />
          </div>
        </div>

        <Separator v-if="searchParams.length > 0" />

        <div v-if="searchParams.length > 0" class="space-y-3" data-testid="query-params-section">
          <h3 class="text-sm font-medium">
            {{ t('tools.url-parser.queryParameters', 'Query Parameters') }}
          </h3>
          <div class="space-y-2">
            <div class="w-full mb-4" data-testid="search-string">
              <InputCopyable
                :value="urlParsed.search"
                readonly
                :field-props="{ orientation: 'vertical' }"
                placeholder=" "
              />
            </div>
            <div
              v-for="[key, value] in searchParams"
              :key="key"
              class="flex w-full items-start gap-3"
              :data-testid="`param-${key}`"
            >
              <div
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground self-end mb-1.5"
              >
                <CornerDownRight class="h-4 w-4" />
              </div>
              <div class="flex-1">
                <InputCopyable
                  :label="t('tools.url-parser.parameterName', 'Parameter')"
                  :value="key"
                  readonly
                  :field-props="{ orientation: 'vertical' }"
                  placeholder=" "
                />
              </div>
              <div class="flex-1">
                <InputCopyable
                  :label="t('tools.url-parser.parameterValue', 'Value')"
                  :value="value"
                  readonly
                  :field-props="{ orientation: 'vertical' }"
                  placeholder=" "
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <div v-else-if="urlToParse.trim() && !urlValidation.isValid" class="text-center text-sm text-muted-foreground">
      {{ t('tools.url-parser.enterUrlToParse', 'Enter a valid URL to see its components.') }}
    </div>
  </div>
</template>
