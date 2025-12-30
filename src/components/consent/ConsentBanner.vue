<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVModel } from '@vueuse/core';
import { X } from 'lucide-vue-next';
import { useConsent } from '@/composable/useConsent';

// UI Components
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  open: boolean;
}

const props = defineProps<Props>();
const open = useVModel(props, 'open');


const { t } = useI18n();
const {
  regionInfo,
  acceptAll,
  rejectAll,
  setCustomConsent,
  consentConfig,
} = useConsent();

// Local state for custom settings
const customAnalyticsEnabled = ref(true);
const customMarketing = ref(true);
const customPreferences = ref(true);

// Region-specific text content
const getRegionText = () => {
  if (!regionInfo.value) return {};

  switch (regionInfo.value.region) {
    case 'gdpr':
      return {
        title: t('consent.gdpr.title', 'Cookie Preferences'),
        description: t('consent.gdpr.description', 'We use cookies and similar technologies to enhance your experience. Under GDPR, we need your consent to use analytics cookies.'),
        acceptAll: t('consent.gdpr.acceptAll', 'Accept All'),
        rejectAll: t('consent.gdpr.rejectAll', 'Reject All'),
        customize: t('consent.gdpr.customize', 'Customize'),
        saveSettings: t('consent.gdpr.saveSettings', 'Save Settings'),
      };
    case 'ccpa':
      return {
        title: t('consent.ccpa.title', 'Privacy Preferences'),
        description: t('consent.ccpa.description', 'We respect your privacy rights under CCPA. You can control how we use your data for analytics and marketing.'),
        acceptAll: t('consent.ccpa.acceptAll', 'Accept All'),
        rejectAll: t('consent.ccpa.rejectAll', 'Reject All'),
        customize: t('consent.ccpa.customize', 'Customize'),
        saveSettings: t('consent.ccpa.saveSettings', 'Save Settings'),
      };
    default:
      return {
        title: t('consent.default.title', 'Privacy Preferences'),
        description: t('consent.default.description', 'Help us improve our service by allowing analytics cookies. You can change these settings anytime.'),
        acceptAll: t('consent.default.acceptAll', 'Accept All'),
        rejectAll: t('consent.default.rejectAll', 'Reject All'),
        customize: t('consent.default.customize', 'Customize'),
        saveSettings: t('consent.default.saveSettings', 'Save Settings'),
      };
  }
};

// Step state
const showCustomize = ref(false);

// Handle accept all
const handleAcceptAll = () => {
  acceptAll();
  open.value = false;
  showCustomize.value = false;
};

// Handle reject all
const handleRejectAll = () => {
  rejectAll();
  open.value = false;
  showCustomize.value = false;
};

// Handle save custom settings
const handleSaveCustom = () => {
  setCustomConsent(
    consentConfig.value.showAnalytics ? customAnalyticsEnabled.value : undefined,
    consentConfig.value.showMarketing ? customMarketing.value : undefined,
    consentConfig.value.showPreferences ? customPreferences.value : undefined
  );
  open.value = false;
  showCustomize.value = false;
};

// Show customize settings
const handleCustomize = () => {
  showCustomize.value = true;
};

// Go back to main settings
const handleBackToMain = () => {
  showCustomize.value = false;
};

const regionText = computed(() => getRegionText());
</script>

<template>
  <!-- Right-bottom corner consent banner -->
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <Card
      v-if="open"
      class="fixed bottom-4 right-4 w-[calc(100vw-2rem)] z-50 shadow-lg border sm:left-auto sm:transform-none sm:w-96 sm:max-w-[calc(100vw-2rem)]"
    >
      <CardHeader>
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <CardTitle class="text-lg">
{{ regionText.title }}
</CardTitle>
            <CardDescription class="mt-1">
              {{ regionText.description }}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            class="h-6 w-6 p-0 ml-2 shrink-0"
            @click="open = false"
          >
            <X />
          </Button>
        </div>
      </CardHeader>

      <CardContent v-if="showCustomize" class="space-y-4">
          <!-- 分析工具设置 -->
          <div v-if="consentConfig.showAnalytics" class="space-y-3">
            <h4 class="text-sm font-medium">
              {{ t('consent.customize.analytics', 'Analytics Cookies') }}
            </h4>
            <div class="flex items-center space-x-2">
              <Checkbox
                id="analytics-enabled"
                v-model="customAnalyticsEnabled"
              />
              <Label for="analytics-enabled" class="text-sm">
                {{ t('consent.customize.analyticsDescription', 'Allow analytics to help us improve our service') }}
              </Label>
            </div>
          </div>

          <!-- 营销设置 -->
          <div v-if="consentConfig.showMarketing" class="space-y-3">
            <h4 class="text-sm font-medium">
              {{ t('consent.customize.marketing', 'Marketing Cookies') }}
            </h4>
            <div class="flex items-center space-x-2">
              <Checkbox
                id="marketing"
                v-model="customMarketing"
              />
              <Label for="marketing" class="text-sm">
                {{ t('consent.customize.marketingDescription', 'Allow personalized ads and marketing communications') }}
              </Label>
            </div>
          </div>

          <!-- 偏好设置 -->
          <div v-if="consentConfig.showPreferences" class="space-y-3">
            <h4 class="text-sm font-medium">
              {{ t('consent.customize.preferences', 'Preference Cookies') }}
            </h4>
            <div class="flex items-center space-x-2">
              <Checkbox
                id="preferences"
                v-model="customPreferences"
              />
              <Label for="preferences" class="text-sm">
                {{ t('consent.customize.preferencesDescription', 'Remember your settings and preferences') }}
              </Label>
            </div>
          </div>

          <!-- 必需设置（始终启用） -->
          <div class="space-y-3">
            <h4 class="text-sm font-medium">
              {{ t('consent.customize.essential', 'Essential Cookies') }}
            </h4>
            <div class="flex items-center space-x-2">
              <Checkbox
                id="essential"
                :model-value="true"
                disabled
              />
              <Label for="essential" class="text-sm text-muted-foreground">
                {{ t('consent.customize.essentialDescription', 'Required for basic website functionality') }}
              </Label>
            </div>
          </div>
      </CardContent>

      <CardFooter class="flex-col space-y-2">
        <!-- 主要设置按钮 -->
        <div v-if="!showCustomize" class="flex flex-col sm:flex-row gap-2 w-full">
          <Button variant="outline" class="flex-1" @click="handleRejectAll">
            {{ regionText.rejectAll }}
          </Button>
          <Button variant="outline" class="flex-1" @click="handleCustomize">
            {{ regionText.customize }}
          </Button>
          <Button class="flex-1" @click="handleAcceptAll">
            {{ regionText.acceptAll }}
          </Button>
        </div>

        <!-- 自定义设置按钮 -->
        <div v-else class="flex gap-2 w-full">
          <Button variant="outline" class="flex-1" @click="handleBackToMain">
            {{ t('consent.back', 'Back') }}
          </Button>
          <Button class="flex-1" @click="handleSaveCustom">
            {{ regionText.saveSettings }}
          </Button>
        </div>
      </CardFooter>
    </Card>
  </Transition>
</template>
