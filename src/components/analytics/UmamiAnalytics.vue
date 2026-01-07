<script lang="ts" setup>
import { config } from '@/config';
import Script from '@/components/Script.vue';
import { useConsentStore } from '@/stores/consent.store';
import { computed } from 'vue';

const consentStore = useConsentStore();

const websiteId = config.umamiAnalytics.websiteId;
const scriptUrl = config.umamiAnalytics.scriptUrl;

// Only show Umami analytics when user consents
const showUmami = computed(() => {
  return websiteId && consentStore.consentState.analytics;
});
</script>

<template>
  <Script
    v-if="showUmami"
    :async="true"
    :data="{ 'website-id': websiteId }"
    :defer="true"
    :src="scriptUrl"
  />
</template>
