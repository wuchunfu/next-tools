<script lang="ts" setup>
import { SpeedInsights } from '@vercel/speed-insights/vue';
import { config } from '@/config';
import { useConsentStore } from '@/stores/consent.store';
import { computed } from 'vue';

const consentStore = useConsentStore();

// Only show Vercel Speed Insights when user consents and it's enabled in config
const showSpeedInsights = computed(() => {
  return config.vercelSpeedInsights.enabled && consentStore.consentState.analytics;
});
</script>

<template>
  <SpeedInsights v-if="showSpeedInsights" />
</template>
