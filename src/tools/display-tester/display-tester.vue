<script setup lang="ts">
import type { Component } from 'vue';
import {
  Maximize,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Palette,
  Layers,
  Grid3x3,
  Zap,
  Circle,
} from 'lucide-vue-next';
import { useMagicKeys, whenever } from '@vueuse/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToolI18n } from '@/composable/useToolI18n';

const { t } = useToolI18n();

type TestMode = 'solid' | 'grayscale' | 'gradient' | 'grid' | 'response';

interface TestPattern {
  mode: TestMode;
  name: string;
  description: string;
  icon: Component;
}

const isTestActive = ref(false);
const currentMode = ref<TestMode>('solid');
const currentIndex = ref(0);
const animationFrame = ref<number | null>(null);
const squarePosition = ref(0);

const testPatterns = computed<TestPattern[]>(() => [
  {
    mode: 'solid',
    name: t('tools.display-tester.testModes.solidColors'),
    description: t('tools.display-tester.instructions.solidColors'),
    icon: Palette,
  },
  {
    mode: 'grayscale',
    name: t('tools.display-tester.testModes.grayscale'),
    description: t('tools.display-tester.instructions.grayscale'),
    icon: Circle,
  },
  {
    mode: 'gradient',
    name: t('tools.display-tester.testModes.gradient'),
    description: t('tools.display-tester.instructions.gradient'),
    icon: Layers,
  },
  {
    mode: 'grid',
    name: t('tools.display-tester.testModes.grid'),
    description: t('tools.display-tester.instructions.grid'),
    icon: Grid3x3,
  },
  {
    mode: 'response',
    name: t('tools.display-tester.testModes.responseTime'),
    description: t('tools.display-tester.instructions.responseTime'),
    icon: Zap,
  },
]);

const solidColors = computed(() => [
  { name: t('tools.display-tester.colors.black'), value: '#000000' },
  { name: t('tools.display-tester.colors.white'), value: '#FFFFFF' },
  { name: t('tools.display-tester.colors.red'), value: '#FF0000' },
  { name: t('tools.display-tester.colors.green'), value: '#00FF00' },
  { name: t('tools.display-tester.colors.blue'), value: '#0000FF' },
  { name: t('tools.display-tester.colors.cyan'), value: '#00FFFF' },
  { name: t('tools.display-tester.colors.magenta'), value: '#FF00FF' },
  { name: t('tools.display-tester.colors.yellow'), value: '#FFFF00' },
]);

const grayscaleLevels = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const gradientTypes = computed(() => [
  { name: `${t('tools.display-tester.colors.white')} → ${t('tools.display-tester.colors.black')}`, gradient: 'linear-gradient(to right, #FFFFFF, #000000)' },
  { name: `${t('tools.display-tester.colors.white')} ↓ ${t('tools.display-tester.colors.black')}`, gradient: 'linear-gradient(to bottom, #FFFFFF, #000000)' },
  { name: `${t('tools.display-tester.colors.red')} → ${t('tools.display-tester.colors.black')}`, gradient: 'linear-gradient(to right, #FF0000, #000000)' },
  { name: `${t('tools.display-tester.colors.green')} → ${t('tools.display-tester.colors.black')}`, gradient: 'linear-gradient(to right, #00FF00, #000000)' },
  { name: `${t('tools.display-tester.colors.blue')} → ${t('tools.display-tester.colors.black')}`, gradient: 'linear-gradient(to right, #0000FF, #000000)' },
]);

const gridTypes = computed(() => [
  { name: `${t('tools.display-tester.colors.white')} / ${t('tools.display-tester.colors.black')}`, bg: '#000000', stroke: '#FFFFFF' },
  { name: `${t('tools.display-tester.colors.black')} / ${t('tools.display-tester.colors.white')}`, bg: '#FFFFFF', stroke: '#000000' },
]);

const currentColor = computed(() => {
  if (currentMode.value === 'solid') {
    return solidColors.value[currentIndex.value]?.value || '#000000';
  }
  if (currentMode.value === 'grayscale') {
    const level = grayscaleLevels[currentIndex.value] || 0;
    const hex = Math.round((level / 100) * 255).toString(16).padStart(2, '0');
    return `#${hex}${hex}${hex}`;
  }
  return '#000000';
});

const currentGradient = computed(() => {
  if (currentMode.value === 'gradient') {
    return gradientTypes.value[currentIndex.value]?.gradient || gradientTypes.value[0]?.gradient || '';
  }
  return '';
});

const currentGrid = computed(() => {
  if (currentMode.value === 'grid') {
    return gridTypes.value[currentIndex.value] || gridTypes.value[0];
  }
  return gridTypes.value[0];
});

const currentLabel = computed(() => {
  if (currentMode.value === 'solid') {
    return solidColors.value[currentIndex.value]?.name || '';
  }
  if (currentMode.value === 'grayscale') {
    const level = grayscaleLevels[currentIndex.value] || 0;
    return t('tools.display-tester.grayscaleLevels.level', { level });
  }
  if (currentMode.value === 'gradient') {
    return gradientTypes.value[currentIndex.value]?.name || '';
  }
  if (currentMode.value === 'grid') {
    return gridTypes.value[currentIndex.value]?.name || '';
  }
  if (currentMode.value === 'response') {
    return t('tools.display-tester.testModes.responseTime');
  }
  return '';
});

const maxIndex = computed(() => {
  if (currentMode.value === 'solid') {
    return solidColors.value.length - 1;
  }
  if (currentMode.value === 'grayscale') {
    return grayscaleLevels.length - 1;
  }
  if (currentMode.value === 'gradient') {
    return gradientTypes.value.length - 1;
  }
  if (currentMode.value === 'grid') {
    return gridTypes.value.length - 1;
  }
  return 0;
});

function startTest(mode: TestMode) {
  currentMode.value = mode;
  currentIndex.value = 0;
  isTestActive.value = true;
  
  nextTick(() => {
    document.documentElement.requestFullscreen?.();
    if (mode === 'response') {
      startAnimation();
    }
  });
}

function exitTest() {
  isTestActive.value = false;
  currentIndex.value = 0;
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
    animationFrame.value = null;
  }
  if (document.fullscreenElement) {
    document.exitFullscreen?.();
  }
}

function nextPattern() {
  if (currentIndex.value < maxIndex.value) {
    currentIndex.value++;
  } 
  else {
    currentIndex.value = 0;
  }
}

function previousPattern() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } 
  else {
    currentIndex.value = maxIndex.value;
  }
}

function startAnimation() {
  const animate = () => {
    squarePosition.value = (squarePosition.value + 2) % window.innerWidth;
    animationFrame.value = requestAnimationFrame(animate);
  };
  animate();
}

// Use VueUse for keyboard shortcuts
const keys = useMagicKeys();
const { Escape, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } = keys;

whenever(() => isTestActive.value && !!Escape?.value, () => {
  exitTest();
});

whenever(() => isTestActive.value && (!!ArrowRight?.value || !!ArrowDown?.value), () => {
  nextPattern();
});

whenever(() => isTestActive.value && (!!ArrowLeft?.value || !!ArrowUp?.value), () => {
  previousPattern();
});

// Listen to fullscreen change to sync state
function handleFullscreenChange() {
  if (!document.fullscreenElement && isTestActive.value) {
    // User exited fullscreen manually (e.g., pressing ESC)
    // Clean up the test state
    isTestActive.value = false;
    currentIndex.value = 0;
    if (animationFrame.value) {
      cancelAnimationFrame(animationFrame.value);
      animationFrame.value = null;
    }
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
  }
  if (document.fullscreenElement) {
    document.exitFullscreen?.();
  }
});
</script>

<template>
  <!-- Test Screen (Fullscreen) -->
  <Teleport to="body">
    <div
      v-if="isTestActive"
      class="fixed inset-0 z-9999"
      :style="{ backgroundColor: currentMode === 'solid' || currentMode === 'grayscale' ? currentColor : 'transparent' }"
    >
      <!-- Gradient Mode -->
      <div
        v-if="currentMode === 'gradient'"
        class="w-full h-full"
        :style="{ background: currentGradient }"
      />

      <!-- Grid Mode -->
      <svg
        v-if="currentMode === 'grid'"
        class="w-full h-full"
        :style="{ backgroundColor: currentGrid?.bg }"
      >
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              :stroke="currentGrid?.stroke"
              stroke-width="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <!-- Response Time Mode -->
      <div v-if="currentMode === 'response'" class="w-full h-full bg-gray-500 relative overflow-hidden">
        <div
          class="absolute top-1/2 -translate-y-1/2 w-20 h-20 bg-white"
          :style="{ left: `${squarePosition}px` }"
        />
      </div>

      <!-- Controls Overlay -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/80 backdrop-blur-sm px-6 py-4 rounded-full">
        <Button
          v-if="maxIndex > 0"
          variant="ghost"
          size="icon"
          class="text-white hover:bg-white/20"
          @click="previousPattern"
        >
          <ChevronLeft class="h-5 w-5" />
        </Button>

        <div class="text-white text-center min-w-50">
          <div class="text-sm font-medium">
            {{ currentLabel }}
          </div>
          <div v-if="maxIndex > 0" class="text-xs text-gray-400 mt-1">
            {{ t('tools.display-tester.controls.pressArrows') }}
          </div>
        </div>

        <Button
          v-if="maxIndex > 0"
          variant="ghost"
          size="icon"
          class="text-white hover:bg-white/20"
          @click="nextPattern"
        >
          <ChevronRight class="h-5 w-5" />
        </Button>

        <Separator v-if="maxIndex > 0" orientation="vertical" class="h-8 bg-white/20 mx-2" />

        <Button
          variant="ghost"
          size="sm"
          class="text-white hover:bg-white/20"
          @click="exitTest"
        >
          {{ t('tools.display-tester.controls.exitFullscreen') }}
        </Button>
      </div>

      <!-- ESC hint -->
      <div class="absolute top-8 left-1/2 -translate-x-1/2 text-white/60 text-sm bg-black/50 px-4 py-2 rounded-full">
        {{ t('tools.display-tester.controls.pressEsc') }}
      </div>
    </div>
  </Teleport>

  <!-- Main UI -->
  <div class="space-y-4">
    <Card>
      <CardContent>
        <!-- Test Mode Selection -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            v-for="pattern in testPatterns"
            :key="pattern.mode"
            :data-testid="`test-mode-${pattern.mode}`"
            class="cursor-pointer transition-all hover:border-primary hover:shadow-md"
            @click="startTest(pattern.mode)"
          >
            <CardContent>
              <div class="flex items-start gap-4">
                <component :is="pattern.icon" class="h-8 w-8 text-primary flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold mb-2">
                    {{ pattern.name }}
                  </h4>
                  <p class="text-sm text-muted-foreground mb-3">
                    {{ pattern.description }}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    class="w-full"
                    :data-testid="`start-test-${pattern.mode}`"
                  >
                    <Maximize class="mr-2 h-4 w-4" />
                    {{ t('tools.display-tester.controls.startTest') }}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator class="my-6" />

        <!-- Tips -->
        <Alert data-testid="testing-tips">
          <Lightbulb class="h-4 w-4" />
          <AlertTitle>{{ t('tools.display-tester.tips.title') }}</AlertTitle>
          <AlertDescription>
            <ul class="list-disc list-inside space-y-1 mt-2 text-sm">
              <li>{{ t('tools.display-tester.tips.tip1') }}</li>
              <li>{{ t('tools.display-tester.tips.tip2') }}</li>
              <li>{{ t('tools.display-tester.tips.tip3') }}</li>
              <li>{{ t('tools.display-tester.tips.tip4') }}</li>
              <li>{{ t('tools.display-tester.tips.tip5') }}</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  </div>
</template>
