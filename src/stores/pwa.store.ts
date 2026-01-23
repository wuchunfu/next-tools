import { defineStore } from 'pinia';
import { registerSW } from 'virtual:pwa-register';
import { useIntervalFn } from '@vueuse/core';
import type { Ref } from 'vue';

export const usePwaStore = defineStore('pwa', () => {
  const needRefresh: Ref<boolean> = ref(false);
  const offlineReady: Ref<boolean> = ref(false);
  const updateServiceWorker: Ref<(() => Promise<void>) | undefined> = ref();

  /**
   * Set the need refresh state
   */
  function setNeedRefresh(value: boolean) {
    needRefresh.value = value;
  }

  /**
   * Set the offline ready state
   */
  function setOfflineReady(value: boolean) {
    offlineReady.value = value;
  }

  /**
   * Update and reload the page
   */
  async function updateAndReload() {
    if (updateServiceWorker.value) {
      await updateServiceWorker.value();
      // Service Worker will automatically refresh the page after update
    }
  }

  /**
   * Close the update prompt
   */
  function closeUpdatePrompt() {
    needRefresh.value = false;
  }

  /**
   * Initialize PWA Service Worker
   * Register Service Worker and set up update checking
   */
  function init() {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        needRefresh.value = true;
      },
      onOfflineReady() {
        offlineReady.value = true;
      },
      onRegisteredSW(swUrl, registration) {
        if (registration) {
          // Check for updates every hour using VueUse
          useIntervalFn(() => registration.update(), 60 * 60 * 1000);
        }
      },
      onRegisterError(error) {
        console.error('Service Worker registration failed:', error);
      },
    });

    // Save the update function
    updateServiceWorker.value = updateSW;
  }

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker,
    setNeedRefresh,
    setOfflineReady,
    updateAndReload,
    closeUpdatePrompt,
    init,
  };
});
