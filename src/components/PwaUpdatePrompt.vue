<script setup lang="tsx">
import { toast } from 'vue-sonner';
import { usePwaStore } from '@/stores/pwa.store';

const pwaStore = usePwaStore();
const { t } = useI18n();

// Initialize PWA when component is mounted
onMounted(() => {
  pwaStore.init();
});

// Watch for refresh needed state
watch(() => pwaStore.needRefresh, (needRefresh) => {
  if (needRefresh) {
    showUpdateToast();
  }
});

function showUpdateToast() {
  toast(computed(() => t('pwa.updateAvailable')), {
    description: computed(() => t('pwa.updateDescription')),
    duration: Infinity, // Never auto-dismiss
    action: {
      label: computed(() => t('pwa.updateNow')),
      onClick: async () => {
        await pwaStore.updateAndReload();
      },
    },
    cancel: {
      label: computed(() => t('pwa.updateLater')),
      onClick: () => {
        pwaStore.closeUpdatePrompt();
      },
    },
  });
}
</script>