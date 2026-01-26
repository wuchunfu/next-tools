<script lang="ts" setup>
import { config } from '@/config';
import { addGtag, configure,  consent } from 'vue-gtag';
import { useConsentStore } from '@/stores/consent.store';
import { watch, computed } from 'vue';
import { isUndefined } from 'lodash-es';
import { whenever } from '@vueuse/core';

const { consentState } = useConsentStore();
const id = config.googleAnalytics.id;

if (id) {
  const hasConsent = computed(() => {
    return !isUndefined(consentState.analytics) || !isUndefined(consentState.marketing);
  });
  
  whenever(hasConsent, () => {
    configure({
      tagId: id,
      config: {
        ad_storage: consentState.analytics ? 'granted' : 'denied',
        analytics_storage: consentState.marketing ? 'granted' : 'denied',
      },
    });
    addGtag();
    watch(
      () => ({
        analytics: consentState.analytics,
        marketing: consentState.marketing,
      }),
      ({ analytics, marketing }) => {
        consent('update', {
          ad_storage: marketing ? 'granted' : 'denied',
          analytics_storage: analytics ? 'granted' : 'denied',
        });
      },
    );
  }, {
    immediate: true,
    once: true
  });
}
</script>
