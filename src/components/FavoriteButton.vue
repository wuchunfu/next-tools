<script setup lang="ts">
import type { HtmlHTMLAttributes } from 'vue'

import type { Tool } from '@/tools/tools.types'
import { Star } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useToolStore } from '@/tools/tools.store'

const props = defineProps<{ tool: Tool, class?: HtmlHTMLAttributes['class'] }>();

const toolStore = useToolStore();

const { tool, class: className } = toRefs(props);

const isFavorite = computed(() => toolStore.isToolFavorite({ tool }));

function toggleFavorite(event: MouseEvent) {
  event.preventDefault();

  if (toolStore.isToolFavorite({ tool })) {
    toolStore.removeToolFromFavorites({ tool });
    return
  }

  toolStore.addToolToFavorites({ tool });
}
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <Button
        variant="ghost"
        size="icon-sm"
        :class="className"
        @click="toggleFavorite"
      >
        <Star :class="isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      {{ isFavorite ? $t('favoriteButton.remove') : $t('favoriteButton.add') }}
    </TooltipContent>
  </Tooltip>
</template>
