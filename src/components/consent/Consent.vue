<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from 'vue';
import { useConsentStore } from '@/stores/consent.store';

const ConsentBanner = defineAsyncComponent(() => import('./ConsentBanner.vue'));

const consentStore = useConsentStore();
const { hasConsentEnabled } = consentStore;

const showConsentModal = ref(false);

watch(
  () => consentStore.needsConsent,
  (needs) => {
    showConsentModal.value = needs;
  },
  { immediate: true },
);
</script>

<template>
  <ConsentBanner v-if="hasConsentEnabled" v-model:open="showConsentModal" />
</template>
