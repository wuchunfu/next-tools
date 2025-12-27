<script lang="ts" setup>
import type { HeadObject } from '@vueuse/head';
import type { Tool } from '@/tools/tools.types';
import { useHead } from '@vueuse/head';
import { storeToRefs } from 'pinia';

import { useRoute } from 'vue-router';
import FavoriteButton from '@/components/FavoriteButton.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolStore } from '@/tools/tools.store';
import BaseLayout from './base.layout.vue';

const route = useRoute()
const toolStore = useToolStore()
const { tools } = storeToRefs(toolStore)

const head = computed<HeadObject>(() => ({
  title: `${toValue(route.meta.name)} - Next Tools`,
  meta: [
    {
      name: 'description',
      content: toValue(route.meta?.description) as string,
    },
    {
      name: 'keywords',
      content: (() => {
        const keywords = toValue(route.meta.keywords)
        if (typeof keywords === 'function') {
          const result = keywords()
          return Array.isArray(result) ? result.join(',') : result
        }
        if (Array.isArray(keywords)) {
          return keywords.join(',')
        }
        if (typeof keywords === 'string') {
          return keywords
        }
        return ''
      })(),
    },
  ],
}))
useHead(head)
const { t } = useI18n()

const i18nKey = computed<string>(() => route.path.trim().replace('/', ''))
const toolTitle = computed<string>(() => t(`tools.${i18nKey.value}.title`, String(route.meta.name)))
const toolDescription = computed<string>(() => t(`tools.${i18nKey.value}.description`, String(route.meta.description)))

const currentTool = computed(() => tools.value.find(tool => tool.path === route.path))
const ToolIcon = computed(() => currentTool.value?.icon)
</script>

<template>
  <BaseLayout>
    <div class="flex h-full w-full flex-col items-center">
      <Card class="flex h-full w-full max-w-5xl flex-1 flex-col border-0 rounded-none shadow-none bg-transparent pb-0">
        <CardHeader class="pb-0">
          <div class="flex items-center gap-2">
            <CardTitle class="flex items-center gap-3 text-xl">
              <component
                :is="ToolIcon"
                v-if="ToolIcon"
                class="size-5 text-primary"
              />
              {{ toolTitle }}
            </CardTitle>
            <FavoriteButton :tool="{ name: route.meta.name, path: route.path } as Tool" />
          </div>
          <CardDescription>
            {{ toolDescription }}
          </CardDescription>
        </CardHeader>

        <CardContent class="flex h-full flex-1 flex-col overflow-auto py-6">
          <slot />
        </CardContent>
      </Card>
    </div>
  </BaseLayout>
</template>
