<script setup lang="ts">
import { watch } from 'vue';
import { loadScript } from '@/utils/script-registry';

interface Props {
  src: string;
  async?: boolean;
  defer?: boolean;
  type?: string;
  crossorigin?: string;
  integrity?: string;
  referrerpolicy?: string;
  data?: Record<string, string>;
}

const props = withDefaults(defineProps<Props>(), {
  async: false,
  defer: false,
  type: 'text/javascript',
  data: () => ({}),
});

const emit = defineEmits<{
  load: [];
  error: [];
}>();

async function loadScriptWithEvents() {
  if (!props.src) return;

  try {
    await loadScript(props.src, {
      async: props.async,
      defer: props.defer,
      type: props.type,
      crossorigin: props.crossorigin,
      integrity: props.integrity,
      referrerpolicy: props.referrerpolicy,
      data: props.data,
    });
    emit('load');
  } catch {
    emit('error');
  }
}

// Watch for src changes - load new script
watch(() => props.src, (newSrc, oldSrc) => {
  if (newSrc !== oldSrc && newSrc) {
    loadScriptWithEvents();
  }
});

// Initial load
loadScriptWithEvents();
</script>
