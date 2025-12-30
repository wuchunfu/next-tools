<script setup lang="ts">
import { defineAsyncComponent, ref, computed, watch } from 'vue';
import { useConsent } from '@/composable/useConsent';

const ConsentBanner = defineAsyncComponent(() => import('./ConsentBanner.vue'));

const { needsConsent, detectRegion, consentConfig } = useConsent();

const showConsentModal = ref(false);

const hasConsentEnabled = computed(() => {
  return Object.values(consentConfig.value).some(value => value);
});

// Check consent requirements when consent options are enabled
watch(hasConsentEnabled, async (hasEnabled) => {
  if (!hasEnabled) {
    return;
  }

  try {
    await detectRegion();
  } catch (error) {
    console.warn('Region detection failed, showing consent modal anyway:', error);
  }
}, { immediate: true });

watch(needsConsent, (needs) => {
  if (!needs) {
    return;
  }
  showConsentModal.value = true;
}, { immediate: true });
</script>

<template>
  <ConsentBanner
    v-if="hasConsentEnabled"
    v-model:open="showConsentModal"
  />
</template>
