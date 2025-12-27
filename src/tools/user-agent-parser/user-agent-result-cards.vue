<script setup lang="ts">
import type { UAParser } from 'ua-parser-js'

import type { UserAgentResultSection } from './user-agent-parser.types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const props = defineProps<{
  userAgentInfo?: UAParser.IResult
  sections: UserAgentResultSection[]
}>()
const { userAgentInfo, sections } = toRefs(props)
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    <Card v-for="section in sections" :key="section.heading" class="flex h-full flex-col gap-2">
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center gap-2 text-base">
          <component :is="section.icon" class="h-5 w-5 text-primary" />
          <span>{{ section.heading }}</span>
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-2 pt-0">
        <div class="flex flex-wrap gap-2">
          <template v-for="field in section.content" :key="field?.label">
            <Badge
              v-if="field && field.getValue(userAgentInfo)"
              variant="secondary"
              class="text-xs font-mono bg-primary/10 text-primary"
              :title="field.label"
            >
              {{ field.getValue(userAgentInfo) }}
            </Badge>
            <Badge
              v-else-if="field && field.undefinedFallback"
              variant="secondary"
              class="text-xs font-mono bg-destructive/10 text-destructive"
              :title="field.label"
            >
              {{ field.undefinedFallback }}
            </Badge>
          </template>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
