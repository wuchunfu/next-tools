<script setup lang="ts">
import type { Component } from 'vue'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const props = defineProps<{ icon: Component, title: string, action: () => void, isActive?: () => boolean }>()
const { icon, title, action, isActive } = toRefs(props)
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 rounded-md border border-transparent text-muted-foreground hover:border-muted-foreground/20" :class="[
          isActive?.() ? 'bg-primary/10 text-primary hover:bg-primary/20' : '',
        ]"
        @click="action"
      >
        <component :is="icon" class="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent align="center">
      {{ title }}
    </TooltipContent>
  </Tooltip>
</template>
