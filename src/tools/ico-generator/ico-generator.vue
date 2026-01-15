<script setup lang="ts">
import { Download, FileImage, Image as ImageIcon, Plus, Settings, Trash2, Upload, X } from 'lucide-vue-next';
import { useStorage } from '@vueuse/core';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldContent, FieldGroup, FieldLabel, FieldTitle } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToolI18n } from '@/composable/useToolI18n';
import { formatBytes } from '@/utils/convert';
import {
  downloadIcoFile,
  formatFileSize,
  generateIcoFile,
  STANDARD_ICO_SIZES,
  validateImageFile,
} from './ico-generator.service';

const { t } = useToolI18n();

// Status enum
enum Status {
  Idle = 'idle',
  Generating = 'generating',
  Success = 'success',
  Error = 'error',
}

const sourceFile = ref<File | null>(null);
const sourceImageUrl = ref<string | null>(null);
const isDragging = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const status = ref<Status>(Status.Idle);
const errorKey = ref<string>('');
const generatedIcoData = ref<Uint8Array | null>(null);
const generatedIcoSize = ref<number>(0);
const outputFilename = ref<string>('favicon');

// Persistent storage for custom sizes
const customSizes = useStorage<Array<{ width: number; height: number }>>('ico-generator:custom-sizes', []);

// Persistent storage for selected sizes (both standard and custom)
const selectedSizes = useStorage<Array<{ width: number; height: number }>>(
  'ico-generator:selected-sizes',
  STANDARD_ICO_SIZES.filter((s) => s.enabled).map(({ width, height }) => ({ width, height })),
);

const customSizeInput = ref<string>('');

const selectedSizesCount = computed(() => selectedSizes.value.length);

// Computed error message for reactive i18n
const errorMessage = computed(() => {
  if (!errorKey.value) {
    return '';
  }
  return t(errorKey.value, 'An error occurred');
});

// Validate custom size input in real-time
const customSizeValidation = computed(() => {
  const input = customSizeInput.value.trim();

  if (!input) {
    return { isValid: false, errorKey: '' };
  }

  // Parse input (support formats: "32", "32x32", "32×32")
  const match = input.match(/^(\d+)(?:[x×](\d+))?$/i);
  if (!match || !match[1]) {
    return { isValid: false, errorKey: 'tools.ico-generator.errorInvalidSize' };
  }

  const width = Number.parseInt(match[1]!, 10);
  const height = match[2] ? Number.parseInt(match[2]!, 10) : width;

  // Validate size (1-512px)
  if (width < 1 || width > 512 || height < 1 || height > 512) {
    return { isValid: false, errorKey: 'tools.ico-generator.errorSizeRange' };
  }

  // Check if size already exists in standard or custom sizes
  const existsInStandard = STANDARD_ICO_SIZES.some((s) => s.width === width && s.height === height);
  const existsInCustom = customSizes.value.some((s) => s.width === width && s.height === height);
  if (existsInStandard || existsInCustom) {
    return { isValid: false, errorKey: 'tools.ico-generator.errorSizeExists' };
  }

  return { isValid: true, errorKey: '' };
});

// Check if a size is selected
function isSizeSelected(width: number, height: number): boolean {
  return selectedSizes.value.some((s) => s.width === width && s.height === height);
}

// Toggle size selection
function toggleSizeEnabled(width: number, height: number, enabled: boolean) {
  if (enabled) {
    // Add to selected sizes if not already selected
    if (!isSizeSelected(width, height)) {
      selectedSizes.value = [...selectedSizes.value, { width, height }];
    }
  } else {
    // Remove from selected sizes
    selectedSizes.value = selectedSizes.value.filter((s) => !(s.width === width && s.height === height));
  }
}

function triggerFileSelect() {
  fileInputRef.value?.click();
}

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    handleFileUpload(file);
  }
}

function onDrop(event: DragEvent) {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    handleFileUpload(file);
  }
}

function handleFileUpload(file: File) {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    status.value = Status.Error;
    errorKey.value = validation.errorKey
      ? `tools.ico-generator.${validation.errorKey}`
      : 'tools.ico-generator.errorInvalidFileType';
    return;
  }

  sourceFile.value = file;
  errorKey.value = '';
  status.value = Status.Idle;
  generatedIcoData.value = null;

  // Set default filename from source file
  const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
  outputFilename.value = nameWithoutExt || 'favicon';

  // Create preview URL
  if (sourceImageUrl.value) {
    URL.revokeObjectURL(sourceImageUrl.value);
  }
  sourceImageUrl.value = URL.createObjectURL(file);
}

function addCustomSize() {
  // Only proceed if validation passes
  if (!customSizeValidation.value.isValid) {
    return;
  }

  const input = customSizeInput.value.trim();
  const match = input.match(/^(\d+)(?:[x×](\d+))?$/i);
  if (!match || !match[1]) {
    return;
  }

  const width = Number.parseInt(match[1]!, 10);
  const height = match[2] ? Number.parseInt(match[2]!, 10) : width;

  // Add custom size to storage
  customSizes.value = [...customSizes.value, { width, height }];

  // Add to selected sizes by default
  selectedSizes.value = [...selectedSizes.value, { width, height }];

  // Clear input
  customSizeInput.value = '';
}

function removeCustomSize(width: number, height: number) {
  // Remove from custom sizes list
  customSizes.value = customSizes.value.filter((s) => !(s.width === width && s.height === height));

  // Remove from selected sizes
  selectedSizes.value = selectedSizes.value.filter((s) => !(s.width === width && s.height === height));
}

function clearAllCustomSizes() {
  // Remove all custom sizes from selected sizes
  selectedSizes.value = selectedSizes.value.filter((selected) => {
    // Keep only if it's a standard size
    return STANDARD_ICO_SIZES.some((s) => s.width === selected.width && s.height === selected.height);
  });

  // Clear all custom sizes
  customSizes.value = [];
}

async function generateIco() {
  if (!sourceFile.value) {
    errorKey.value = 'tools.ico-generator.errorNoFile';
    status.value = Status.Error;
    return;
  }

  if (selectedSizesCount.value === 0) {
    errorKey.value = 'tools.ico-generator.errorNoSizes';
    status.value = Status.Error;
    return;
  }

  try {
    status.value = Status.Generating;
    errorKey.value = '';

    const icoData = await generateIcoFile(sourceFile.value, selectedSizes.value);
    generatedIcoData.value = icoData;
    generatedIcoSize.value = icoData.length;
    status.value = Status.Success;
  } catch (error) {
    console.error('Failed to generate ICO:', error);
    errorKey.value = 'tools.ico-generator.errorGenerateFailed';
    status.value = Status.Error;
  }
}

function downloadIco() {
  if (!generatedIcoData.value) {
    return;
  }

  downloadIcoFile(generatedIcoData.value, outputFilename.value);
}

function reset() {
  sourceFile.value = null;
  if (sourceImageUrl.value) {
    URL.revokeObjectURL(sourceImageUrl.value);
  }
  sourceImageUrl.value = null;
  generatedIcoData.value = null;
  generatedIcoSize.value = 0;
  status.value = Status.Idle;
  errorKey.value = '';
  outputFilename.value = 'favicon';
  customSizeInput.value = '';

  // Clear file input to allow re-selecting the same file
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

const statusLabel = computed(() => {
  switch (status.value) {
    case Status.Generating:
      return t('tools.ico-generator.statusGenerating', 'Generating...');
    case Status.Success:
      return t('tools.ico-generator.statusSuccess', 'Success');
    case Status.Error:
      return t('tools.ico-generator.statusError', 'Error');
    default:
      return t('tools.ico-generator.statusIdle', 'Ready');
  }
});

// Watch selectedSizes to handle orphaned sizes
// If a size is selected but not in standard or custom sizes, add it to custom sizes
watch(
  selectedSizes,
  (newSelectedSizes) => {
    const orphanedSizes = newSelectedSizes.filter((selected) => {
      const isStandard = STANDARD_ICO_SIZES.some((s) => s.width === selected.width && s.height === selected.height);
      const isCustom = customSizes.value.some((s) => s.width === selected.width && s.height === selected.height);
      return !isStandard && !isCustom;
    });

    if (orphanedSizes.length > 0) {
      customSizes.value = [...customSizes.value, ...orphanedSizes];
    }
  },
  { immediate: true },
);

// Cleanup on unmount
onUnmounted(() => {
  if (sourceImageUrl.value) {
    URL.revokeObjectURL(sourceImageUrl.value);
  }
});
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Upload & Configuration -->
    <Card class="flex flex-col">
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center gap-2">
          <ImageIcon class="h-5 w-5 text-primary" />
          {{ t('tools.ico-generator.cardUploadTitle') }}
        </CardTitle>
      </CardHeader>
      <CardContent class="flex flex-1 flex-col gap-4">
        <!-- Upload Area -->
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
              {{ t('tools.ico-generator.uploadCta') }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ t('tools.ico-generator.uploadHint') }}
            </p>
          </div>
          <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="onFileSelected">
        </div>

        <Separator />

        <!-- Status -->
        <FieldGroup class="space-y-3">
          <Field orientation="horizontal">
            <FieldLabel class="w-28 text-right text-sm text-muted-foreground" data-testid="status-label">
              {{ t('tools.ico-generator.statusLabel') }}
            </FieldLabel>
            <FieldContent data-testid="status-value">
              <Badge class="self-end" :variant="status === Status.Error ? 'destructive' : status === Status.Success ? 'default' : 'secondary'">
                {{ statusLabel }}
              </Badge>
            </FieldContent>
          </Field>

          <!-- File Info -->
          <Field orientation="vertical">
            <FieldLabel data-testid="file-info-label">
{{ t('tools.ico-generator.fileInfo') }}
</FieldLabel>
            <FieldContent>
              <div v-if="sourceFile" class="rounded-lg border bg-muted/40 p-3" data-testid="file-info-content">
                <div class="flex items-center justify-between">
                  <FieldTitle data-testid="file-name">
{{ sourceFile.name }}
</FieldTitle>
                  <span class="text-sm text-muted-foreground" data-testid="file-size">{{ formatBytes(sourceFile.size) }}</span>
                </div>
              </div>
              <div v-else class="rounded-lg border border-dashed bg-muted/20 p-3 text-sm text-muted-foreground" data-testid="no-file-message">
                {{ t('tools.ico-generator.noFileSelected') }}
              </div>
            </FieldContent>
          </Field>

          <!-- Source Preview -->
          <Field v-if="sourceImageUrl" orientation="vertical">
            <FieldLabel>{{ t('tools.ico-generator.preview') }}</FieldLabel>
            <FieldContent>
              <div class="flex justify-center rounded-lg border bg-muted/20 p-4">
                <img :src="sourceImageUrl" alt="Source image preview" class="h-32 w-32 object-contain">
              </div>
            </FieldContent>
          </Field>
        </FieldGroup>

        <Alert v-if="status === Status.Error" variant="destructive">
          <AlertTitle>{{ t('tools.ico-generator.statusError') }}</AlertTitle>
          <AlertDescription>{{ errorMessage }}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>

    <!-- Configuration & Output -->
    <Card class="flex flex-col">
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center gap-2">
          <Settings class="h-5 w-5 text-primary" />
          {{ t('tools.ico-generator.cardConfigTitle') }}
        </CardTitle>
      </CardHeader>
      <CardContent class="flex flex-1 flex-col gap-4">
        <!-- Size Selection -->
        <Field orientation="vertical">
          <FieldLabel data-testid="icon-sizes-label">
            {{ t('tools.ico-generator.sizesLabel') }}
            <span class="ml-2 text-xs text-muted-foreground" data-testid="selected-count">
              ({{ t('tools.ico-generator.selectedCount', { count: selectedSizesCount }) }})
            </span>
          </FieldLabel>
          <FieldContent>
            <!-- Standard Sizes -->
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3 rounded-lg border bg-muted/20 p-3" data-testid="standard-sizes-grid">
                <div
                  v-for="size in STANDARD_ICO_SIZES"
                  :key="`${size.width}x${size.height}`"
                  class="flex items-center gap-2"
                >
                  <Checkbox
                    :id="`size-${size.width}`"
                    :data-testid="`checkbox-size-${size.width}`"
                    :model-value="isSizeSelected(size.width, size.height)"
                    @update:model-value="(checked) => toggleSizeEnabled(size.width, size.height, checked as boolean)"
                  />
                  <label :for="`size-${size.width}`" class="text-sm font-medium leading-none cursor-pointer">
                    {{ size.width }}×{{ size.height }}
                  </label>
                </div>
              </div>

              <!-- Custom Sizes -->
              <div v-if="customSizes.length > 0" class="space-y-2" data-testid="custom-sizes-section">
                <div class="flex items-center justify-between">
                  <div class="text-xs font-medium text-muted-foreground">
                    {{ t('tools.ico-generator.customSizes') }}
                  </div>
                  <Button type="button" variant="ghost" size="sm" class="h-6 px-2 text-xs" data-testid="clear-all-custom-sizes-btn" @click="clearAllCustomSizes">
                    <Trash2 class="mr-1 h-3 w-3" />
                    {{ t('tools.ico-generator.clearCustomSizes') }}
                  </Button>
                </div>
                <div class="flex flex-wrap gap-2" data-testid="custom-sizes-list">
                  <div
                    v-for="size in customSizes"
                    :key="`custom-${size.width}x${size.height}`"
                    :data-testid="`custom-size-item-${size.width}x${size.height}`"
                    class="flex items-center gap-2 rounded-md border bg-muted/40 px-2.5 py-1"
                  >
                    <Checkbox
                      :id="`custom-size-${size.width}-${size.height}`"
                      :data-testid="`checkbox-custom-${size.width}x${size.height}`"
                      :model-value="isSizeSelected(size.width, size.height)"
                      @update:model-value="(checked) => toggleSizeEnabled(size.width, size.height, checked as boolean)"
                    />
                    <label :for="`custom-size-${size.width}-${size.height}`" class="text-sm font-medium cursor-pointer">
                      {{ size.width }}×{{ size.height }}
                    </label>
                    <button
                      type="button"
                      :data-testid="`remove-custom-size-${size.width}x${size.height}`"
                      class="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                      @click="removeCustomSize(size.width, size.height)"
                    >
                      <X class="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Add Custom Size -->
              <div class="flex gap-2">
                <Input
                  v-model="customSizeInput"
                  :placeholder="t('tools.ico-generator.customSizePlaceholder')"
                  class="flex-1"
                  data-testid="custom-size-input"
                  @keydown.enter="addCustomSize"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  :disabled="!customSizeValidation.isValid"
                  data-testid="add-custom-size-btn"
                  @click="addCustomSize"
                >
                  <Plus class="h-4 w-4" />
                </Button>
              </div>
              <p class="text-xs text-muted-foreground">
                {{ t('tools.ico-generator.customSizeHint') }}
              </p>
              <p v-if="customSizeValidation.errorKey" class="text-xs text-destructive">
                {{ t(customSizeValidation.errorKey) }}
              </p>
            </div>
          </FieldContent>
        </Field>

        <Separator />

        <!-- Output Filename -->
        <Field orientation="vertical">
          <FieldLabel data-testid="output-filename-label">
            {{ t('tools.ico-generator.filenameLabel') }}
          </FieldLabel>
          <FieldContent>
            <div class="flex items-center gap-2">
              <Input v-model="outputFilename" placeholder="favicon" class="flex-1" data-testid="output-filename-input" />
              <span class="text-sm text-muted-foreground">.ico</span>
            </div>
          </FieldContent>
        </Field>

        <Separator />

        <!-- Actions -->
        <div class="flex flex-col gap-2">
          <Button :disabled="!sourceFile || selectedSizesCount === 0 || status === Status.Generating" data-testid="generate-btn" @click="generateIco">
            <FileImage class="mr-2 h-4 w-4" />
            {{ status === Status.Generating ? t('tools.ico-generator.generating') : t('tools.ico-generator.generate') }}
          </Button>

          <Button v-if="generatedIcoData" variant="default" data-testid="download-btn" @click="downloadIco">
            <Download class="mr-2 h-4 w-4" />
            {{ t('tools.ico-generator.download') }}
          </Button>

          <Button v-if="sourceFile" variant="outline" data-testid="reset-btn" @click="reset">
            {{ t('tools.ico-generator.reset') }}
          </Button>
        </div>

        <template v-if="generatedIcoData">
          <Separator />

          <!-- Generated File Info -->
          <Field orientation="vertical">
            <FieldLabel>{{ t('tools.ico-generator.generatedFileInfo') }}</FieldLabel>
            <FieldContent>
              <div class="rounded-lg border bg-muted/40 p-3">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-muted-foreground">{{ t('tools.ico-generator.filename') }}</span>
                    <FieldTitle class="text-sm">
{{ outputFilename }}.ico
</FieldTitle>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-muted-foreground">{{ t('tools.ico-generator.fileSize') }}</span>
                    <span class="text-sm font-medium">{{ formatFileSize(generatedIcoSize) }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-muted-foreground">{{ t('tools.ico-generator.sizes') }}</span>
                    <span class="text-sm font-medium">{{ selectedSizesCount }}</span>
                  </div>
                </div>
              </div>
            </FieldContent>
          </Field>
        </template>

        <Alert v-if="status === Status.Success">
          <AlertTitle>{{ t('tools.ico-generator.statusSuccess') }}</AlertTitle>
          <AlertDescription>{{ t('tools.ico-generator.successMessage') }}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  </div>
</template>
