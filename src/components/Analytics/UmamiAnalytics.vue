<script setup lang="ts">
import { config } from '@/config';
import Script from '@/components/Script.vue';

const websiteId = config.umamiAnalytics.websiteId;
const scriptUrl = config.umamiAnalytics.scriptUrl;
</script>

<template>
  <Script
    v-if="websiteId"
    :src="scriptUrl"
    :async="true"
    :defer="true"
    :data="{ 'website-id': websiteId }"
  />
</template>
