<script setup lang="ts">
import type { Tool } from '@/tools/tools.types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import FavoriteButton from './FavoriteButton.vue';

const props = defineProps<{ tool: Tool & { category: string } }>()
const { tool } = toRefs(props)
</script>

<template>
  <router-link :to="tool.path" class="block h-full group">
    <Card class="h-full transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.01] p-0">
      <CardContent class="p-6">
        <!-- Header: Icon and badges -->
        <div class="flex items-start justify-between mb-2">
          <component
            :is="tool.icon"
            class="size-6 text-muted-foreground group-hover:text-primary transition-colors duration-200 shrink-0"
          />

          <div class="flex items-center gap-2 shrink-0">
            <Badge
              v-if="tool.isNew"
              variant="default"
              class="text-xs px-2 py-1 bg-destructive"
            >
              {{ $t('toolCard.new') }}
            </Badge>

            <FavoriteButton :tool="tool" />
          </div>
        </div>

        <!-- Title -->
        <h3 class="text-md font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-200">
          {{ tool.name }}
        </h3>

        <!-- Description -->
        <p class="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {{ tool.description }}
        </p>
      </CardContent>
    </Card>
  </router-link>
</template>
