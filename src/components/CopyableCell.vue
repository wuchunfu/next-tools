<script setup lang="ts">
import { Copy } from 'lucide-vue-next'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCopy } from '@/composable/copy';
import { useToolI18n } from '@/composable/useToolI18n';

const props = withDefaults(
  defineProps<{
    value: string
    showIcon?: boolean
    class?: string
  }>(),
  {
    showIcon: true,
    class: '',
  },
)

const { t } = useToolI18n()
const { copy, isJustCopied } = useCopy({
  source: computed(() => props.value),
  createToast: true,
  text: computed(() => t('common.copied', 'Copied!')),
})

const tooltipText = computed(() =>
  isJustCopied.value
    ? t('common.copied', 'Copied!')
    : t('common.copyToClipboard', 'Copy to clipboard'),
)
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <span
        class="inline-flex items-center gap-3 cursor-pointer font-mono text-sm hover:text-primary transition-colors duration-200 active:scale-[0.98] select-none" :class="[
          props.class,
        ]"
        @click="copy()"
      >
        <span class="break-all">{{ value }}</span>
        <Copy
          v-if="showIcon"
          class="h-3.5 w-3.5 shrink-0 transition-all duration-200 opacity-40 hover:opacity-70" :class="[
            isJustCopied ? 'opacity-100 text-primary scale-110' : '',
          ]"
        />
      </span>
    </TooltipTrigger>
    <TooltipContent>
      {{ tooltipText }}
    </TooltipContent>
  </Tooltip>
</template>
