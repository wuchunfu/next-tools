<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { config } from '@/config';

const VercelAnalytics = defineAsyncComponent(() => import('./VercelAnalytics.vue'));
const VercelSpeedInsights = defineAsyncComponent(() => import('./VercelSpeedInsights.vue'));
const GoogleAnalytics = defineAsyncComponent(() => import('./GoogleAnalytics.vue'));
const UmamiAnalytics = defineAsyncComponent(() => import('./UmamiAnalytics.vue'));
</script>

<template>
  <VercelAnalytics v-if="config.vercelAnalytics.enabled" />
  <VercelSpeedInsights v-if="config.vercelSpeedInsights.enabled" />
  <GoogleAnalytics v-if="!!config.googleAnalytics.id" />
  <UmamiAnalytics v-if="!!config.umamiAnalytics.websiteId" />
</template>


