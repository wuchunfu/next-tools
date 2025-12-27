<script setup lang="ts">
import type { EmojiInfo } from './emoji.types';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { useCopy } from '@/composable/copy'
import { useToolI18n } from '@/composable/useToolI18n'

const props = defineProps<{ emojiInfo: EmojiInfo }>();
const { emojiInfo } = toRefs(props);

const { t } = useToolI18n();
const { copy } = useCopy();

function copyEmoji() {
  copy(emojiInfo.value.emoji, { notificationMessage: t('tools.emoji-picker.copyEmoji', { emoji: emojiInfo.value.emoji }) });
}

function copyCodePoints(event: Event) {
  event.stopPropagation();
  copy(emojiInfo.value.codePoints, { notificationMessage: t('tools.emoji-picker.copyCodePoints', { value: emojiInfo.value.codePoints }) });
}

function copyUnicode(event: Event) {
  event.stopPropagation();
  copy(emojiInfo.value.unicode, { notificationMessage: t('tools.emoji-picker.copyUnicode', { value: emojiInfo.value.unicode }) });
}
</script>

<template>
  <Item variant="outline" @click="copyEmoji">
    <ItemMedia variant="icon">
      {{ emojiInfo.emoji }}
    </ItemMedia>

    <ItemContent class="overflow-hidden">
      <ItemTitle>{{ emojiInfo.title }}</ItemTitle>
      <ItemDescription class="flex items-center gap-3 text-xs font-mono">
        <span class="cursor-pointer transition hover:text-primary" @click="copyCodePoints">{{ emojiInfo.codePoints }}</span>
        <span class="cursor-pointer truncate transition hover:text-primary" @click="copyUnicode">{{ emojiInfo.unicode }}</span>
      </ItemDescription>
    </ItemContent>
  </Item>
</template>
