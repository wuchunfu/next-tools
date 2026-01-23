<script setup lang="ts">
import type { Ref } from 'vue';
import { useBase64 } from '@vueuse/core';
import { Download, File, FileUp, Image as ImageIcon, Upload } from 'lucide-vue-next';
import InputCopyable from '@/components/InputCopyable.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  getExtensionFromMimeType,
  getMimeTypeFromBase64,
  useDownloadFileFromBase64Refs,
} from '@/composable/downloadBase64';
import { useToolI18n } from '@/composable/useToolI18n';
import { useValidation } from '@/composable/validation';
import { isValidBase64 } from '@/utils/base64';

const fileName = ref('file')
const fileExtension = ref('')
const base64Input = ref('')
// Debounced version for validation and MIME type detection
const base64InputDebounced = ref('')

// Sync base64Input to base64InputDebounced with debounce (300ms)
watchDebounced(
  base64Input,
  (newValue) => {
    base64InputDebounced.value = newValue
  },
  { debounce: 300 },
)

const { download } = useDownloadFileFromBase64Refs({
  source: base64Input,
  filename: fileName,
  extension: fileExtension,
})
const { t } = useToolI18n()
const base64InputValidation = useValidation({
  source: base64InputDebounced,
  rules: computed(() => [
    {
      message: t('tools.base64-file-converter.invalidBase64', 'Invalid Base64 string'),
      validator: (value: string) => isValidBase64(value.trim()),
    },
  ]),
})

const detectedMimeType = computed(() => {
  if (!base64InputDebounced.value.trim()) { return null }
  const { mimeType } = getMimeTypeFromBase64({ base64String: base64InputDebounced.value })
  return mimeType
});

const isImage = computed(() => detectedMimeType.value?.startsWith('image/') ?? false)

watch(base64InputDebounced, (newValue) => {
  const { mimeType } = getMimeTypeFromBase64({ base64String: newValue })
  if (mimeType) {
    fileExtension.value = getExtensionFromMimeType(mimeType) || fileExtension.value
  }
})

const previewImageSrc = computed(() => {
  if (!isImage.value || !base64InputValidation.isValid || !base64InputDebounced.value.trim()) {
    return null
  }
  try {
    // Ensure base64 string has data URL prefix
    const base64String = base64InputDebounced.value.trim()
    if (base64String.startsWith('data:')) {
      return base64String
    }
    const { mimeType } = getMimeTypeFromBase64({ base64String })
    if (mimeType) {
      return `data:${mimeType};base64,${base64String}`
    }
    return `data:image/png;base64,${base64String}`
  }
  catch {
    return null
  }
})

const previewError = computed(() => {
  if (!isImage.value || !base64InputValidation.isValid) {
    return false
  }
  return previewImageSrc.value === null
});

function downloadFile() {
  if (!base64InputValidation.isValid) { return }
  try {
    download()
  }
  catch {
    //
  }
}

const fileInput = ref() as Ref<File>
const { base64: fileBase64 } = useBase64(fileInput)

const fileInputRef = ref<HTMLInputElement>()
const isDragging = ref(false)

async function onUpload(file: File | null) {
  if (file) {
    fileInput.value = file
  }
}

function handleFileSelect() {
  fileInputRef.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  onUpload(file)
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files[0] ?? null
  onUpload(file)
}

const fileInfo = computed(() => {
  if (!fileInput.value) { return null }
  const size = fileInput.value.size
  const sizeKB = (size / 1024).toFixed(2)
  const sizeMB = (size / (1024 * 1024)).toFixed(2)
  return {
    name: fileInput.value.name,
    size: size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`,
    type: fileInput.value.type || t('tools.base64-file-converter.unknownType', 'Unknown'),
  }
});

const base64InputLength = computed(() => base64Input.value.trim().length)
const fileBase64Length = computed(() => fileBase64.value?.length ?? 0)
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <Card class="h-full min-w-0 gap-2">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <FileUp class="h-5 w-5 text-primary" />
            {{ t('tools.base64-file-converter.cardDecodeTitle', 'Base64 to File') }}
          </CardTitle>
          <CardDescription>
            {{
              t(
                'tools.base64-file-converter.cardDecodeDescription',
                'Decode Base64 strings and download as files. Supports image preview.',
              )
            }}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent class="min-w-0 space-y-5">
        <FieldSet class="min-w-0">
          <FieldGroup class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field orientation="vertical" class="gap-2 sm:col-span-2">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.base64-file-converter.fileName') }}
              </FieldLabel>
              <Input v-model="fileName" :placeholder="t('tools.base64-file-converter.downloadFilename')" />
            </Field>

            <Field orientation="vertical" class="gap-2">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.base64-file-converter.extension') }}
              </FieldLabel>
              <Input v-model="fileExtension" :placeholder="t('tools.base64-file-converter.extension')" />
            </Field>
          </FieldGroup>

          <Separator />

          <Field orientation="vertical" class="gap-3">
            <div class="flex items-center justify-between">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.base64-file-converter.base64InputLabel', 'Base64 string') }}
              </FieldLabel>
              <Badge v-if="base64InputLength > 0" variant="outline" class="text-xs">
                {{ t('tools.base64-file-converter.length', 'Length') }}: {{ base64InputLength }}
              </Badge>
            </div>
            <Textarea
              v-model="base64Input"
              rows="8"
              class="max-h-56 resize-y overflow-auto font-mono"
              :class="{ 'border-destructive ring-1 ring-destructive/60': base64InputValidation.status === 'error' }"
              :placeholder="t('tools.base64-file-converter.base64InputPlaceholder')"
            />
            <p v-if="base64InputValidation.status === 'error'" class="text-xs text-destructive">
              {{ base64InputValidation.message }}
            </p>
            <div
              v-if="detectedMimeType"
              class="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground"
            >
              <Badge variant="secondary" class="max-w-full shrink whitespace-normal text-xs">
                {{ t('tools.base64-file-converter.detectedType', 'Detected type') }}: {{ detectedMimeType }}
              </Badge>
              <Badge v-if="isImage" variant="outline" class="shrink-0 text-xs">
                <ImageIcon class="mr-1 inline-block h-3 w-3" />
                {{ t('tools.base64-file-converter.imageFile', 'Image') }}
              </Badge>
            </div>
          </Field>
        </FieldSet>

        <template v-if="isImage && base64InputValidation.isValid">
          <Separator />
          <div class="space-y-3">
            <FieldLabel class="text-sm font-medium">
              {{ t('tools.base64-file-converter.imagePreview', 'Image preview') }}
            </FieldLabel>
            <div
              class="min-h-50 w-full rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground flex items-center justify-center"
            >
              <img
                v-if="previewImageSrc && !previewError"
                :src="previewImageSrc"
                class="max-w-full max-h-100 object-contain"
                alt="Preview"
              >
              <p v-else-if="previewError" class="text-sm text-destructive">
                {{ t('tools.base64-file-converter.previewError', 'Failed to preview image') }}
              </p>
            </div>
          </div>
        </template>

        <div class="flex flex-wrap justify-end gap-3">
          <Button
            variant="default"
            :disabled="base64Input === '' || !base64InputValidation.isValid"
            @click="downloadFile"
          >
            <Download class="mr-2 h-4 w-4" />
            {{ t('tools.base64-file-converter.downloadFile') }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card class="h-full min-w-0 gap-2">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Upload class="h-5 w-5 text-primary" />
            {{ t('tools.base64-file-converter.cardEncodeTitle', 'File to Base64') }}
          </CardTitle>
          <CardDescription>
            {{
              t('tools.base64-file-converter.cardEncodeDescription', 'Upload files and convert them to Base64 format.')
            }}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent class="min-w-0 space-y-5">
        <FieldSet class="min-w-0 w-full">
          <Field orientation="vertical" class="gap-3 min-w-0">
            <FieldLabel class="text-sm font-medium">
              {{ t('tools.base64-file-converter.fileUploadLabel', 'Select file') }}
            </FieldLabel>
            <div
              class="relative cursor-pointer rounded-lg border-2 border-dashed transition-colors"
              :class="isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              @drop="handleDrop"
              @click="handleFileSelect"
            >
              <input ref="fileInputRef" type="file" class="hidden" @change="handleFileChange">
              <div class="flex flex-col items-center justify-center gap-3 p-8 text-center">
                <div class="rounded-full bg-primary/10 p-3">
                  <Upload class="h-6 w-6 text-primary" />
                </div>
                <div class="space-y-1">
                  <p class="text-sm font-medium">
                    {{ t('tools.base64-file-converter.uploadCta', 'Click to upload or drag and drop') }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ t('tools.base64-file-converter.uploadHint', 'Any file type supported') }}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="fileInfo" class="min-w-0 rounded-lg border bg-muted/30 p-3">
              <div class="flex items-start gap-3 min-w-0">
                <File class="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div class="min-w-0 flex-1 space-y-1">
                  <p class="text-sm font-medium truncate">
                    {{ fileInfo.name }}
                  </p>
                  <div class="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" class="max-w-full shrink whitespace-normal text-xs">
                      {{ t('tools.base64-file-converter.fileSize', 'Size') }}: {{ fileInfo.size }}
                    </Badge>
                    <Badge variant="outline" class="max-w-full shrink whitespace-normal text-xs">
                      {{ t('tools.base64-file-converter.fileType', 'Type') }}: {{ fileInfo.type }}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Field>

          <Separator />

          <Field orientation="vertical" class="gap-3">
            <div class="flex items-center justify-between">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.base64-file-converter.fileBase64Label', 'Base64 output') }}
              </FieldLabel>
              <Badge v-if="fileBase64Length > 0" variant="outline" class="text-xs">
                {{ t('tools.base64-file-converter.length', 'Length') }}: {{ fileBase64Length }}
              </Badge>
            </div>
            <FieldContent>
              <InputCopyable
                :value="fileBase64 || ''"
                :placeholder="t('tools.base64-file-converter.fileBase64Placeholder')"
                :field-props="{ orientation: 'vertical' }"
                readonly
              />
            </FieldContent>
          </Field>
        </FieldSet>
      </CardContent>
    </Card>
  </div>
</template>
