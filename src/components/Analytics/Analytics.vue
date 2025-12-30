<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { config } from '@/config';

const VercelAnalytics = defineAsyncComponent(() => import('@/analytics/VercelAnalytics.vue'));
const GoogleAnalytics = defineAsyncComponent(() => import('@/analytics/GoogleAnalytics.vue'));
const UmamiAnalytics = defineAsyncComponent(() => import('@/analytics/UmamiAnalytics.vue'));
</script>

<template>
  <VercelAnalytics v-if="config.vercelAnalytics.enabled" />
  <GoogleAnalytics v-if="!!config.googleAnalytics.id" />
  <UmamiAnalytics v-if="!!config.umamiAnalytics.websiteId" />
</template>


