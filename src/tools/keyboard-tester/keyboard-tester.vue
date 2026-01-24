<script setup lang="ts">
import { RotateCcw } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useElementSize } from '@vueuse/core';
import { useToolI18n } from '@/composable/useToolI18n';
import { getKeyboardLayout, getGridColumns, getGridRows, KeyboardLayoutEnum, KeyboardSizeEnum } from './keyboard-tester.service';
import type {KeyDefinition, KeyboardLayout, KeyboardSize} from './keyboard-tester.service';

const { t } = useToolI18n();

const pressedKeys = ref<Set<string>>(new Set());
const testedKeys = ref<Set<string>>(new Set());
const selectedLayout = ref<KeyboardLayout>(KeyboardLayoutEnum.QWERTY);
const selectedSize = ref<KeyboardSize>(KeyboardSizeEnum.TKL);
const keyboardContainer = ref<HTMLElement | null>(null);
const keyboardElement = ref<HTMLElement | null>(null);
const scale = ref(1);
const containerHeight = ref('auto');

// Watch container size changes
const { width: containerWidth } = useElementSize(keyboardContainer);

const keyboardLayout = computed(() => getKeyboardLayout(selectedLayout.value, selectedSize.value));

const gridColumns = computed(() => getGridColumns(selectedSize.value));

const gridRows = computed(() => getGridRows(selectedSize.value));

// Computed labels for select values
const currentLayoutLabel = computed(() => {
  const labels: Record<KeyboardLayout, string> = {
    [KeyboardLayoutEnum.QWERTY]: 'QWERTY',
    [KeyboardLayoutEnum.AZERTY]: 'AZERTY',
    [KeyboardLayoutEnum.DVORAK]: 'DVORAK',
    [KeyboardLayoutEnum.COLEMAK]: 'COLEMAK',
  };
  return labels[selectedLayout.value];
});

const currentSizeLabel = computed(() => {
  const labels: Record<KeyboardSize, string> = {
    [KeyboardSizeEnum.FULL]: t('tools.keyboard-tester.sizes.full'),
    [KeyboardSizeEnum.TKL]: t('tools.keyboard-tester.sizes.tkl'),
    [KeyboardSizeEnum.COMPACT_60]: t('tools.keyboard-tester.sizes.60'),
  };
  return labels[selectedSize.value];
});

function updateScale() {
  if (!keyboardElement.value || containerWidth.value === 0) return;
  
  // Get keyboard original width (before scaling)
  const keyboardOriginalWidth = keyboardElement.value.scrollWidth;
  
  // Calculate scale ratio
  if (containerWidth.value < keyboardOriginalWidth) {
    scale.value = containerWidth.value / keyboardOriginalWidth;
  } else {
    scale.value = 1;
  }
  
  // Get keyboard original height
  const keyboardOriginalHeight = keyboardElement.value.scrollHeight;
  
  // Calculate scaled height
  const scaledHeight = keyboardOriginalHeight * scale.value;
  containerHeight.value = `${scaledHeight}px`;
}

function handleKeyDown(event: KeyboardEvent) {
  event.preventDefault();
  const code = event.code;
  
  if (code) {
    pressedKeys.value.add(code);
    testedKeys.value.add(code);
  }
}

function handleKeyUp(event: KeyboardEvent) {
  event.preventDefault();
  const code = event.code;
  
  if (code) {
    pressedKeys.value.delete(code);
  }
}

function resetTest() {
  pressedKeys.value.clear();
  testedKeys.value.clear();
}

function getKeyClass(key: KeyDefinition) {
  const isPressed = pressedKeys.value.has(key.code);
  const isTested = testedKeys.value.has(key.code);
  
  return {
    'bg-primary text-primary-foreground shadow-lg scale-95': isPressed,
    'bg-green-500/20 border-green-500': !isPressed && isTested,
    'bg-muted hover:bg-muted/80': !isPressed && !isTested,
  };
}

function getKeyStyle(key: KeyDefinition) {
  const width = (key.width || 1) * 3.5;
  const height = key.height || 1;
  const minHeight = height * 3.5; // 3.5rem per height unit
  return {
    width: `${width}rem`,
    minHeight: `${minHeight}rem`,
    gridColumn: `${Math.floor(key.col * 4) + 1} / span ${Math.ceil((key.width || 1) * 4)}`,
    gridRow: `${Math.floor(key.row * 4) + 1} / span ${Math.ceil(height * 4)}`,
  };
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  
  nextTick(() => {
    updateScale();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});

// Watch container width changes
watch(containerWidth, () => {
  nextTick(() => {
    updateScale();
  });
});

// Watch layout and size changes
watch([selectedSize, selectedLayout], () => {
  nextTick(() => {
    updateScale();
  });
});
</script>

<template>
  <Card data-testid="keyboard-display">
    <CardContent class="pt-6 space-y-6">
      <!-- Settings and Reset -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Layout Selection -->
        <div class="space-y-2">
          <Label>{{ t('tools.keyboard-tester.layout') }}</Label>
          <Select v-model="selectedLayout" data-testid="layout-select">
            <SelectTrigger>
              <SelectValue>{{ currentLayoutLabel }}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="KeyboardLayoutEnum.QWERTY">
QWERTY
</SelectItem>
              <SelectItem :value="KeyboardLayoutEnum.AZERTY">
AZERTY
</SelectItem>
              <SelectItem :value="KeyboardLayoutEnum.DVORAK">
DVORAK
</SelectItem>
              <SelectItem :value="KeyboardLayoutEnum.COLEMAK">
COLEMAK
</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Size Selection -->
        <div class="space-y-2">
          <Label>{{ t('tools.keyboard-tester.size') }}</Label>
          <Select v-model="selectedSize" data-testid="size-select">
            <SelectTrigger>
              <SelectValue>{{ currentSizeLabel }}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="KeyboardSizeEnum.FULL">
{{ t('tools.keyboard-tester.sizes.full') }}
</SelectItem>
              <SelectItem :value="KeyboardSizeEnum.TKL">
{{ t('tools.keyboard-tester.sizes.tkl') }}
</SelectItem>
              <SelectItem :value="KeyboardSizeEnum.COMPACT_60">
{{ t('tools.keyboard-tester.sizes.60') }}
</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Reset Button -->
        <div class="space-y-2 flex justify-start items-end md:justify-end">
          <Button variant="outline" data-testid="reset-button" @click="resetTest">
            <RotateCcw class="mr-2 h-4 w-4" />
            {{ t('tools.keyboard-tester.reset') }}
          </Button>
        </div>
      </div>

      <!-- Keyboard -->
      <div 
        ref="keyboardContainer" 
        class="w-full flex justify-center transition-all duration-300 overflow-hidden"
        :style="{ height: containerHeight }"
      >
        <div 
          ref="keyboardElement"
          class="inline-grid gap-1 p-6 bg-gradient-to-br from-muted/50 to-muted rounded-lg transition-transform duration-300 w-fit h-fit"
          :style="`
            grid-template-columns: repeat(${gridColumns}, 1fr); 
            grid-template-rows: repeat(${gridRows}, 1fr);
            transform: scale(${scale});
            transform-origin: top center;
          `"
        >
          <div
            v-for="key in keyboardLayout"
            :key="key.code"
            :data-testid="`key-${key.code}`"
            :class="getKeyClass(key)"
            :style="getKeyStyle(key)"
            class="flex items-center justify-center text-xs font-medium border rounded transition-all duration-150 cursor-default select-none"
          >
            {{ key.label }}
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap justify-center gap-6 pt-4 border-t">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-muted border rounded" />
          <span class="text-sm text-muted-foreground">{{ t('tools.keyboard-tester.legend.untested') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary text-primary-foreground border rounded flex items-center justify-center text-xs">
            A
          </div>
          <span class="text-sm text-muted-foreground">{{ t('tools.keyboard-tester.legend.pressed') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-green-500/20 border-green-500 border rounded" />
          <span class="text-sm text-muted-foreground">{{ t('tools.keyboard-tester.legend.tested') }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
