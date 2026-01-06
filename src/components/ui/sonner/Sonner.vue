<script lang="ts" setup>
import type { ToasterProps } from 'vue-sonner'
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon, XIcon } from 'lucide-vue-next'
import { Toaster as Sonner } from 'vue-sonner'
import { cn } from '@/lib/utils'
import 'vue-sonner/style.css';

const props = defineProps<ToasterProps>();
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--color-popover)',
      '--normal-text': 'var(--color-popover-foreground)',
      '--normal-border': 'var(--color-border)',
      '--border-radius': 'var(--radius)',
    }"
    v-bind="props"
    :toast-options="{
      classes: {
        toast: 'gap-2!',
        title: 'text-sm!',
        description: 'text-muted-foreground! text-xs!',
        actionButton: 'bg-primary! text-primary-foreground! text-xs! hover:bg-primary/90! h-auto! rounded-md! py-1! px-2! transition-all!',
        cancelButton: 'bg-secondary! text-secondary-foreground! hover:bg-secondary/80! text-xs! h-auto! rounded-md! py-1! px-2! transition-all!',
      },
    }"
  >
    <template #success-icon>
      <CircleCheckIcon class="size-4 text-green-500" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-4 text-blue-500" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-4 text-amber-500" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-4 text-destructive" />
    </template>
    <template #loading-icon>
      <div>
        <Loader2Icon class="size-4 animate-spin text-primary" />
      </div>
    </template>
    <template #close-icon>
      <XIcon class="size-4" />
    </template>
  </Sonner>
</template>
