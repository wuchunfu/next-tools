<script setup lang="ts">
import { config } from '@/config';
import Script from '@/components/Script.vue';
import { useConsent } from '@/composable/useConsent';
import { computed } from 'vue';

const { consentState, hasConsented } = useConsent();

const websiteId = config.umamiAnalytics.websiteId;
const scriptUrl = config.umamiAnalytics.scriptUrl;

// Only show Umami Analytics when user consents
const showUmami = computed(() => {
  return websiteId && hasConsented.value && consentState.value.analytics;
});
</script>

<template>
  <Script
    v-if="showUmami"
    :src="scriptUrl"
    :async="true"
    :defer="true"
    :data="{ 'website-id': websiteId }"
  />
</template>
