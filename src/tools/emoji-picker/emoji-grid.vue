<script setup lang="ts">
import type { EmojiInfo } from './emoji.types';

const props = withDefaults(defineProps<{ emojiInfos?: EmojiInfo[] }>(), { emojiInfos: () => [] });
const { emojiInfos } = toRefs(props);
</script>

<template>
  <div class="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
    <emoji-card v-for="emojiInfo in emojiInfos" :key="emojiInfo.name" :emoji-info="emojiInfo" />
  </div>
</template>
