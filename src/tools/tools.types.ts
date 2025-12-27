import type { Component, MaybeRefOrGetter } from 'vue'

export interface Tool {
  key: string
  name: MaybeRefOrGetter<string>
  path: string
  description: MaybeRefOrGetter<string>
  keywords: MaybeRefOrGetter<string | string[]>
  component: () => Promise<Component>
  icon: Component
  redirectFrom?: string[]
  isNew: boolean
  createdAt?: Date
}

export interface ToolCategory {
  name: string
  components: Tool[]
}

export type ToolWithCategory = Tool & { category: string }
