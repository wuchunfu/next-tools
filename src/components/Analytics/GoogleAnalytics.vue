<script setup lang="ts">
import { config } from '@/config';
import { configure, useConsent as useGtagConsent } from 'vue-gtag';
import { useConsent } from '@/composable/useConsent';
import { watch } from 'vue';

const { consentState } = useConsent();
const { acceptCustom } = useGtagConsent();
const id = config.googleAnalytics.id;

// Initialize Google Analytics in manual mode
const initGoogleAnalytics = () => {
  if (id) {
    configure({
      tagId: id,
      initMode: 'manual'
    });
  }
};

// Initialize immediately if ID exists
initGoogleAnalytics();

// Watch for consent state changes and update Google Analytics consent
watch(
  () => ({
    analytics: consentState.value.analytics,
    marketing: consentState.value.marketing
  }),
  ({ analytics, marketing }) => {
    if (id) {
      acceptCustom({
        ad_storage: marketing ? 'granted' : 'denied',
        analytics_storage: analytics ? 'granted' : 'denied'
      });
    }
  },
  { immediate: true }
);
</script>


