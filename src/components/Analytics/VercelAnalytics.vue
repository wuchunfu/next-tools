<script setup lang="ts">
import { Analytics } from '@vercel/analytics/vue';
import { config } from '@/config';
import { useConsent } from '@/composable/useConsent';
import { computed } from 'vue';

const { consentState, hasConsented } = useConsent();

// Only show Vercel Analytics when user consents and it's enabled in config
const showVercel = computed(() => {
  return config.vercelAnalytics.enabled && hasConsented.value && consentState.value.analytics;
});
</script>

<template>
  <Analytics v-if="showVercel" :debug="config.vercelAnalytics.debug" />
</template>


