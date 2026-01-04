<script setup lang="ts">
import type { EmojiInfo } from './emoji.types'
import emojiKeywords from 'emojilib'
import { capitalize, chain, map } from 'lodash-es'
import { Search } from 'lucide-vue-next'
import emojiUnicodeData from 'unicode-emoji-json'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import useDebouncedRef from '@/composable/debouncedref'
import { useFuzzySearch } from '@/composable/fuzzySearch'
import { useToolI18n } from '@/composable/useToolI18n'

function escapeUnicode({ emoji }: { emoji: string }) {
  return emoji
    .split('')
    .map(unit => `\\u${unit.charCodeAt(0).toString(16).padStart(4, '0')}`)
    .join('');
}
function getEmojiCodePoints({ emoji }: { emoji: string }) {
  return emoji.codePointAt(0) ? `0x${emoji.codePointAt(0)?.toString(16)}` : undefined;
}

const { t } = useToolI18n();

const emojis = map(emojiUnicodeData, (emojiInfo, emoji) => ({
  ...emojiInfo,
  emoji,
  title: capitalize(emojiInfo.name),
  keywords: emojiKeywords[emoji as keyof typeof emojiKeywords],
  codePoints: getEmojiCodePoints({ emoji }),
  unicode: escapeUnicode({ emoji }),
}));

const emojisGroups: { emojiInfos: EmojiInfo[], group: string }[] = chain(emojis)
  .groupBy('group')
  .map((emojiInfos, group) => ({ group, emojiInfos }))
  .value();

const searchQuery = useDebouncedRef('', 300);

const { searchResult } = useFuzzySearch({
  search: searchQuery,
  data: emojis,
  options: {
    keys: ['group', { name: 'name', weight: 3 }, 'keywords', 'unicode', 'codePoints', 'emoji'],
    threshold: 0.3,
    useExtendedSearch: true,
    isCaseSensitive: false,
  },
});
</script>

<template>
  <div class="mx-auto w-full max-w-5xl">
    <Card>
      <CardContent class="space-y-6">
        <InputGroup>
          <InputGroupInput v-model="searchQuery" :placeholder="t('tools.emoji-picker.searchPlaceholder')" />
          <InputGroupAddon>
            <Search class="h-4 w-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <div class="text-sm text-muted-foreground">
              {{ searchQuery.trim().length ? `${searchResult.length} results` : '' }}
            </div>
          </InputGroupAddon>
        </InputGroup>

        <div v-if="searchQuery.trim().length > 0">
          <div v-if="searchResult.length === 0">
            <Empty>
              <EmptyContent>
                <EmptyMedia variant="icon">
                  <Search class="h-6 w-6" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>{{ t('tools.emoji-picker.noResults') }}</EmptyTitle>
                  <EmptyDescription>{{ t('tools.emoji-picker.noResultsDescription', 'Try another keyword or browse categories') }}</EmptyDescription>
                </EmptyHeader>
              </EmptyContent>
            </Empty>
          </div>
          <div v-else>
            <div class="text-lg font-bold mb-3">
              {{ t('tools.emoji-picker.searchResult') }}
            </div>
            <emoji-grid :emoji-infos="searchResult" />
          </div>
        </div>

        <div v-else>
          <div v-for="{ group, emojiInfos } in emojisGroups" :key="group" class="mb-6">
            <div class="text-lg font-bold mb-3">
              {{ group }}
            </div>
            <emoji-grid :emoji-infos="emojiInfos" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
