<script setup lang="ts">
import { useElementSize } from '@vueuse/core';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-vue-next';
import { types as extensionToMimeType, extensions as mimeTypeToExtension } from 'mime-types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Field, FieldContent, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToolI18n } from '@/composable/useToolI18n';
import { cn } from '@/lib/utils'
import { tableCellClasses, tableContainerClasses, tableHeadClasses, tableHeaderClasses } from '@/utils/table'

const { t } = useToolI18n()

const mimeInfos = Object.entries(mimeTypeToExtension).map(([mimeType, extensions]) => ({ mimeType, extensions }))

const mimeToExtensionsOptions = Object.keys(mimeTypeToExtension).map(label => ({ label, value: label }))
const selectedMimeType = ref<string | undefined>(undefined)

const extensionsFound = computed<string[]>(() => {
  if (!selectedMimeType.value) { return [] }
  const result = mimeTypeToExtension[selectedMimeType.value]
  return Array.isArray(result) ? result : result ? [result] : []
});

const extensionToMimeTypeOptions = Object.keys(extensionToMimeType).map((label) => {
  const extension = `.${label}`
  return { label: extension, value: label }
});
const selectedExtension = ref<string | undefined>(undefined)

const mimeTypeFound = computed(() => {
  if (!selectedExtension.value) { return '' }
  const result = extensionToMimeType[selectedExtension.value]
  if (Array.isArray(result)) { return result.join(', ') }
  return result ?? ''
});

const tableFilter = ref('')
const filteredMimeInfos = computed(() => {
  const term = tableFilter.value.trim().toLowerCase()
  if (!term) { return mimeInfos }
  return mimeInfos.filter(({ mimeType, extensions }) =>
    mimeType.toLowerCase().includes(term)
    || extensions.some(ext => `.${ext}`.toLowerCase().includes(term)),
  )
});

const mimeSelectOpen = ref(false)
const extensionSelectOpen = ref(false)

const mimeTriggerRef = ref<HTMLElement | null>(null)
const extensionTriggerRef = ref<HTMLElement | null>(null)
const { width: mimeTriggerWidth } = useElementSize(mimeTriggerRef, undefined, {
  box: 'border-box',
})
const { width: extensionTriggerWidth } = useElementSize(extensionTriggerRef, undefined, {
  box: 'border-box',
})

function clearMimeSelection() {
  selectedMimeType.value = undefined
}

function clearExtensionSelection() {
  selectedExtension.value = undefined
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{{ t('tools.mime-types.mimeToExt.title') }}</CardTitle>
          <CardDescription>{{ t('tools.mime-types.mimeToExt.subtitle') }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <FieldSet class="space-y-3">
            <Field orientation="vertical" class="gap-3">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.mime-types.mimeToExt.placeholder') }}
              </FieldLabel>
              <FieldContent class="flex flex-col gap-3">
                <Popover v-model:open="mimeSelectOpen">
                  <PopoverTrigger as-child>
                    <Button
                      ref="mimeTriggerRef"
                      variant="outline"
                      role="combobox"
                      :class="`w-full justify-between ${selectedMimeType ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'}`"
                    >
                      <span>
                        {{ selectedMimeType ? selectedMimeType : t('tools.mime-types.mimeToExt.placeholder') }}
                      </span>
                      <ChevronsUpDownIcon class="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    class="p-0"
                    :style="{
                      width: mimeTriggerWidth ? `${mimeTriggerWidth}px` : undefined,
                      maxWidth: mimeTriggerWidth ? `${mimeTriggerWidth}px` : undefined,
                    }"
                  >
                    <Command>
                      <CommandInput :placeholder="t('common.search', 'Search...')" />
                      <CommandList>
                        <CommandEmpty>{{ t('common.noResults', 'No results found') }}</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            v-for="opt in mimeToExtensionsOptions"
                            :key="opt.value"
                            :value="opt.value"
                            @select="() => { selectedMimeType = opt.value; mimeSelectOpen = false; }"
                          >
                            {{ opt.label }}
                            <CheckIcon
                              class="ml-auto h-4 w-4"
                              :class="selectedMimeType === opt.value ? 'opacity-100' : 'opacity-0'"
                            />
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div class="flex flex-wrap gap-2">
                  <Button size="sm" variant="ghost" @click="clearMimeSelection">
                    {{ t('common.clear', 'Clear') }}
                  </Button>
                </div>
              </FieldContent>
            </Field>
          </FieldSet>

          <div v-if="extensionsFound.length > 0" class="space-y-2 rounded-lg border bg-muted/40 p-3">
            <p class="text-sm text-muted-foreground">
              {{ t('tools.mime-types.mimeToExt.resultPrefix') }}
              <Badge class="ml-1" variant="secondary">
                {{ selectedMimeType }}
              </Badge>
              {{ t('tools.mime-types.mimeToExt.resultSuffix') }}
            </p>
            <div class="flex flex-wrap gap-2">
              <Badge v-for="extension of extensionsFound" :key="extension" variant="outline">
                .{{ extension }}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{{ t('tools.mime-types.extToMime.title') }}</CardTitle>
          <CardDescription>{{ t('tools.mime-types.extToMime.subtitle') }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <FieldSet class="space-y-3">
            <Field orientation="vertical" class="gap-3">
              <FieldLabel class="text-sm font-medium">
                {{ t('tools.mime-types.extToMime.placeholder') }}
              </FieldLabel>
              <FieldContent class="flex flex-col gap-3">
                <Popover v-model:open="extensionSelectOpen">
                  <PopoverTrigger as-child>
                    <Button
                      ref="extensionTriggerRef"
                      variant="outline"
                      role="combobox"
                      :class="`w-full justify-between ${selectedExtension ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'}`"
                    >
                      <span>
                        {{ selectedExtension ? `.${selectedExtension}` : t('tools.mime-types.extToMime.placeholder') }}
                      </span>
                      <ChevronsUpDownIcon class="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    class="p-0"
                    :style="{
                      width: extensionTriggerWidth ? `${extensionTriggerWidth}px` : undefined,
                      maxWidth: extensionTriggerWidth ? `${extensionTriggerWidth}px` : undefined,
                    }"
                  >
                    <Command>
                      <CommandInput :placeholder="t('common.search', 'Search...')" />
                      <CommandList>
                        <CommandEmpty>{{ t('common.noResults', 'No results found') }}</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            v-for="opt in extensionToMimeTypeOptions"
                            :key="opt.value"
                            :value="opt.value"
                            @select="() => { selectedExtension = opt.value; extensionSelectOpen = false; }"
                          >
                            {{ opt.label }}
                            <CheckIcon
                              class="ml-auto h-4 w-4"
                              :class="selectedExtension === opt.value ? 'opacity-100' : 'opacity-0'"
                            />
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div class="flex flex-wrap gap-2">
                  <Button size="sm" variant="ghost" @click="clearExtensionSelection">
                    {{ t('common.clear', 'Clear') }}
                  </Button>
                </div>
              </FieldContent>
            </Field>
          </FieldSet>

          <div v-if="selectedExtension" class="space-y-2 rounded-lg border bg-muted/40 p-3">
            <p class="text-sm text-muted-foreground">
              {{ t('tools.mime-types.extToMime.resultPrefix') }}
              <Badge class="ml-1" variant="secondary">
                {{ selectedExtension }}
              </Badge>
              {{ t('tools.mime-types.extToMime.resultSuffix') }}
            </p>
            <div class="flex flex-wrap gap-2">
              <Badge variant="outline">
                {{ mimeTypeFound }}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader class="space-y-3">
        <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div class="space-y-1">
            <CardTitle>{{ t('tools.mime-types.tableTitle', 'All MIME Types') }}</CardTitle>
            <CardDescription>
              {{ t('tools.mime-types.tableSubtitle', 'Browse the complete list of MIME types and their extensions.') }}
            </CardDescription>
          </div>
          <Input
            v-model="tableFilter"
            :placeholder="t('search.placeholder', 'Search...')"
            class="w-full md:w-72"
          />
        </div>
      </CardHeader>
      <CardContent class="px-6">
        <Table :container-class="cn(tableContainerClasses, 'max-h-120 overflow-y-auto')">
          <TableHeader :class="tableHeaderClasses">
            <TableRow>
              <TableHead :class="cn(tableHeadClasses, 'w-2/3')">
                {{ t('tools.mime-types.table.mime') }}
              </TableHead>
              <TableHead :class="cn(tableHeadClasses, 'w-1/3')">
                {{ t('tools.mime-types.table.extensions') }}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="{ mimeType, extensions } of filteredMimeInfos" :key="mimeType">
              <TableCell :class="cn(tableCellClasses, 'font-medium')">
                {{ mimeType }}
              </TableCell>
              <TableCell>
                <div class="flex flex-wrap gap-2">
                  <Badge v-for="extension of extensions" :key="extension" variant="outline">
                    .{{ extension }}
                  </Badge>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
