<script lang="ts" setup>
import { SpeedInsights } from '@vercel/speed-insights/vue';
import { config } from '@/config';
import { useConsent } from '@/composable/useConsent';
import { computed } from 'vue';

const { consentState } = useConsent();

// Only show Vercel Speed Insights when user consents and it's enabled in config
const showSpeedInsights = computed(() => {
  return config.vercelSpeedInsights.enabled && consentState.value.analytics;
});
</script>

<template>
  <SpeedInsights v-if="showSpeedInsights" />
</template>
