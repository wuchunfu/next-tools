<script lang="ts" setup>
import { Analytics } from '@vercel/analytics/vue';
import { config } from '@/config';
import { useConsentStore } from '@/stores/consent.store';
import { computed } from 'vue';

const consentStore = useConsentStore();

// Only show Vercel analytics when user consents and it's enabled in config
const showVercel = computed(() => {
  return config.vercelAnalytics.enabled && consentStore.consentState.analytics;
});
</script>

<template>
  <Analytics v-if="showVercel" :debug="config.vercelAnalytics.debug" />
</template>


