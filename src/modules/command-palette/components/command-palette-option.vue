<script setup lang="ts">
import type { PaletteOption } from '../command-palette.types'

import { ArrowUpRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = withDefaults(defineProps<{ option: PaletteOption, selected?: boolean }>(), {
  selected: false,
});
const emit = defineEmits(['activated']);
const { option } = toRefs(props);
const { selected } = toRefs(props);
</script>

<template>
  <Button
    variant="ghost"
    class="w-full justify-start gap-3 rounded-lg px-3 py-2 text-left transition-colors"
    :class="selected ? 'bg-accent text-accent-foreground' : 'text-foreground/80 hover:text-foreground hover:bg-muted/70'"
    @click="() => emit('activated', option)"
  >
    <component :is="option.icon" v-if="option.icon" class="h-4 w-4 shrink-0 text-muted-foreground" />

    <div class="flex-1 overflow-hidden">
      <div class="truncate text-sm font-medium">
        {{ option.name }}
      </div>
      <div v-if="option.description" class="truncate text-xs text-muted-foreground/80">
        {{ option.description }}
      </div>
    </div>

    <ArrowUpRight v-if="option.href" class="h-4 w-4 text-muted-foreground/70" />
  </Button>
</template>
