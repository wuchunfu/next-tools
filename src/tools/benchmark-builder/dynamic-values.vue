<script setup lang="ts">
import { useTemplateRefsList, useVModel } from '@vueuse/core'
import { Plus, X } from 'lucide-vue-next'
import { computed, nextTick } from 'vue'
import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'
import { useToolI18n } from '@/composable/useToolI18n'

const props = defineProps<{ values: (number | null)[] }>();
const emit = defineEmits(['update:values']);

// useTemplateRefsList will hold input elements to manage focus
const refs = useTemplateRefsList<any>();

const values = useVModel(props, 'values', emit);
const { t } = useToolI18n();

async function addValue() {
  values.value.push(null);
  await nextTick();
  refs.value[refs.value.length - 1]?.focus?.();
}

function onInputEnter(index: number) {
  if (index === values.value.length - 1) {
    addValue();
    return
  }

  refs.value[index + 1]?.focus?.();
}

function inputModel(index: number) {
  return computed<string | number>({
    get() {
      const v = values.value[index];
      return v != null ? String(v) : '';
    },
    set(val: string | number) {
      if (typeof val === 'number') {
        values.value[index] = Number(val);
        return
      }

      values.value[index] = val === '' ? null : Number(val);
    },
  });
}
</script>

<template>
  <div class="space-y-2">
    <div v-for="(value, index) of values" :key="index" class="flex flex-nowrap gap-2">
      <Input
        :ref="refs.set"
        :model-value="inputModel(index).value"
        type="number"
        :placeholder="t('tools.benchmark-builder.setMeasure')"
        class="flex-1"
        @update:model-value="(val) => (inputModel(index).value = val)"
        @keydown.enter="onInputEnter(index)"
      />

      <Button variant="ghost" size="sm" :title="t('tools.benchmark-builder.deleteValue')" @click="values.splice(index, 1)">
        <X class="text-muted-foreground" />
      </Button>
    </div>

    <Button @click="addValue">
      <Plus class="mr-2 h-4 w-4" />
      {{ t('tools.benchmark-builder.addMeasure') }}
    </Button>
  </div>
</template>
