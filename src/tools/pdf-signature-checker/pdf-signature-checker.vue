<script setup lang="ts">
import type { SignatureInfo } from './pdf-signature-checker.types';
import { FileText, ShieldCheck, Upload } from 'lucide-vue-next';
import verifyPDF from 'pdf-signature-reader';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToolI18n } from '@/composable/useToolI18n';
import { formatBytes } from '@/utils/convert';
import PdfSignatureDetails from './components/pdf-signature-details.vue';

const signatures = ref<SignatureInfo[]>([])
const status = ref<'idle' | 'parsed' | 'error' | 'loading'>('idle')
const file = ref<File | null>(null)
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const { t } = useToolI18n()

async function onVerifyClicked(uploadedFile: File) {
  file.value = uploadedFile
  status.value = 'loading'

  const fileBuffer = await uploadedFile.arrayBuffer()
  try {
    const { signatures: parsedSignatures } = verifyPDF(fileBuffer)
    signatures.value = parsedSignatures
    status.value = 'parsed'
  }
  catch {
    signatures.value = []
    status.value = 'error'
  }
}

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const uploadedFile = target.files?.[0]
  if (uploadedFile) {
    onVerifyClicked(uploadedFile)
  }
}

function triggerFileSelect() {
  fileInputRef.value?.click()
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const uploadedFile = event.dataTransfer?.files?.[0]
  if (uploadedFile) {
    onVerifyClicked(uploadedFile)
  }
}

const statusLabel = computed(() => {
  switch (status.value) {
    case 'loading':
      return t('tools.pdf-signature-checker.statusLoading')
    case 'parsed':
      return t('tools.pdf-signature-checker.statusParsed')
    case 'error':
      return t('tools.pdf-signature-checker.statusError')
    default:
      return t('tools.pdf-signature-checker.statusIdle')
  }
})
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Upload -->
    <Card class="flex flex-col">
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center gap-2">
          <FileText class="h-5 w-5 text-primary" />
          {{ t('tools.pdf-signature-checker.cardUploadTitle', 'Upload PDF') }}
        </CardTitle>
      </CardHeader>
      <CardContent class="flex flex-1 flex-col gap-4">
        <div
          class="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/40 bg-muted/20 p-6 text-center transition hover:border-primary/60 hover:bg-primary/5"
          :class="{ 'border-primary/60 bg-primary/10': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
          @click="triggerFileSelect"
        >
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Upload class="h-6 w-6" />
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium text-foreground">
              {{ t('tools.pdf-signature-checker.uploadCta') }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ t('tools.pdf-signature-checker.uploadHint') }}
            </p>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept=".pdf"
            class="hidden"
            @change="onFileSelected"
          >
        </div>

        <Separator />

        <FieldGroup class="space-y-3">
          <Field orientation="horizontal">
            <FieldLabel class="w-28 text-right text-sm text-muted-foreground">
              {{ t('tools.pdf-signature-checker.statusLabel', 'Status') }}
            </FieldLabel>
            <FieldContent>
              <Badge :variant="status === 'error' ? 'destructive' : status === 'parsed' ? 'default' : 'secondary'">
                {{ statusLabel }}
              </Badge>
            </FieldContent>
          </Field>

          <Field orientation="vertical">
            <FieldLabel>{{ t('tools.pdf-signature-checker.fileInfo', 'File info') }}</FieldLabel>
            <FieldContent>
              <div v-if="file" class="rounded-lg border bg-muted/40 p-3">
                <div class="flex items-center justify-between">
                  <FieldTitle>{{ file.name }}</FieldTitle>
                  <span class="text-sm text-muted-foreground">{{ formatBytes(file.size) }}</span>
                </div>
              </div>
              <div v-else class="rounded-lg border border-dashed bg-muted/20 p-3 text-sm text-muted-foreground">
                {{ t('tools.pdf-signature-checker.noFileSelected') }}
              </div>
            </FieldContent>
          </Field>
        </FieldGroup>

        <Alert v-if="status === 'error'" variant="destructive">
          <AlertTitle>{{ t('tools.pdf-signature-checker.statusError') }}</AlertTitle>
          <AlertDescription>{{ t('tools.pdf-signature-checker.noSignatures') }}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>

    <!-- Results -->
    <Card class="flex flex-col">
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center gap-2">
          <ShieldCheck class="h-5 w-5 text-primary" />
          {{ t('tools.pdf-signature-checker.cardResultTitle', 'Signatures') }}
        </CardTitle>
      </CardHeader>
      <CardContent class="flex flex-1 flex-col gap-4">
        <div class="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <span>{{ t('tools.pdf-signature-checker.statusLabel', 'Status') }}: {{ statusLabel }}</span>
          <span>
            {{ t('tools.pdf-signature-checker.signaturesCount', { count: signatures.length }) }}
          </span>
        </div>

        <Separator />

        <div v-if="status === 'loading'" class="rounded-lg border bg-muted/30 p-6 text-center text-sm text-muted-foreground animate-pulse">
          {{ t('tools.pdf-signature-checker.statusLoading') }}
        </div>

        <div
          v-else-if="status === 'parsed' && signatures.length === 0"
          class="rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground"
        >
          {{ t('tools.pdf-signature-checker.noSignatures') }}
        </div>

        <ScrollArea v-else-if="status === 'parsed'" class="max-h-130 rounded-lg border">
          <div class="divide-y">
            <div
              v-for="(signature, index) of signatures"
              :key="index"
              class="p-4"
            >
              <div class="mb-3 flex items-center justify-between">
                <FieldTitle class="text-base">
                  {{ t('tools.pdf-signature-checker.signatureCertificates', { index: index + 1 }) }}
                </FieldTitle>
                <Badge variant="outline" class="text-xs">
                  {{ t('tools.pdf-signature-checker.certificateName', { index: index + 1 }) }}
                </Badge>
              </div>
              <PdfSignatureDetails :signature="signature" />
            </div>
          </div>
        </ScrollArea>

        <div v-else class="rounded-lg border border-dashed bg-muted/10 p-6 text-center text-sm text-muted-foreground">
          {{ t('tools.pdf-signature-checker.statusIdle') }}
        </div>
      </CardContent>
    </Card>
  </div>
</template>
