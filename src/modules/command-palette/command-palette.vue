<script setup lang="ts">
import type { PaletteOption } from './command-palette.types';
import { useMagicKeys, whenever } from '@vueuse/core';
import { isUndefined } from 'lodash';
import { ArrowUpRight, Search } from 'lucide-vue-next';

import { storeToRefs } from 'pinia';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Kbd } from '@/components/ui/kbd';
import { useCommandPaletteStore } from './command-palette.store';

const isModalOpen = ref(false)
const router = useRouter()
const isMac = computed(() => window.navigator.userAgent.toLowerCase().includes('mac'))

const commandPaletteStore = useCommandPaletteStore()
const { filteredSearchResult, searchPrompt } = storeToRefs(commandPaletteStore)

const { ctrl_k, meta_k, escape } = useMagicKeys()

const ctrlK = computed(() => ctrl_k?.value ?? false)
const metaK = computed(() => meta_k?.value ?? false)
const escapeKey = computed(() => escape?.value ?? false)

// 根据操作系统返回正确的键盘组合
const commandKey = computed(() => isMac.value ? metaK.value : ctrlK.value)

whenever(commandKey, open)
whenever(escapeKey, close)

function open() {
  isModalOpen.value = true
}

function close() {
  isModalOpen.value = false
}

function activateOption(option: PaletteOption) {
  const { closeOnSelect } = option

  if (option.action) {
    option.action()
    if (closeOnSelect) { close() }
    return
  }

  const closeAfterNavigation = closeOnSelect || isUndefined(closeOnSelect)

  if (option.to) {
    router.push(option.to)
    if (closeAfterNavigation) { close() }
    return
  }

  if (option!.href) {
    window.open(option.href, '_blank')
    if (closeAfterNavigation) { close() }
  }
}
</script>

<template>
  <div class="flex-1">
    <Button variant="outline" class="w-full justify-start gap-3 text-muted-foreground" @click="isModalOpen = true">
      <Search class="h-4 w-4" />
      <span class="text-sm">{{ $t('search.label') }}</span>
      <span class="ml-auto hidden items-center gap-1 text-xs text-muted-foreground/80 sm:flex">
        <Kbd>{{ isMac ? '⌘' : 'Ctrl' }}</Kbd>
        <span>+</span>
        <Kbd>K</Kbd>
      </span>
    </Button>

    <CommandDialog v-model:open="isModalOpen">
      <Command ignore-filter class="rounded-lg border shadow-md">
        <CommandInput
          v-model="searchPrompt"
          :placeholder="$t('search.placeholder', 'Type to search a tool or a command...')"
          class="border-b"
        />
        <CommandList class="max-h-[60vh] overflow-y-auto">
          <CommandEmpty v-if="searchPrompt && !Object.keys(filteredSearchResult).length">
            {{ $t('search.noResults', 'No results found.') }}
          </CommandEmpty>
          <template v-for="(options, category, index) in filteredSearchResult as Record<string, PaletteOption[]>" :key="category">
            <CommandGroup :heading="String(category)" class="px-1">
              <CommandItem
                v-for="option in options as PaletteOption[]"
                :key="option.name"
                :value="option.name"
                class="gap-3 rounded-md px-3 py-2"
                @select="() => activateOption(option)"
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
                <ArrowUpRight v-if="option!.href" class="ml-auto h-4 w-4 shrink-0 text-muted-foreground/80" />
              </CommandItem>
            </CommandGroup>
            <CommandSeparator v-if="index < Object.keys(filteredSearchResult).length - 1" />
          </template>
        </CommandList>
      </Command>
    </CommandDialog>
  </div>
</template>
