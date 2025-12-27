<script setup lang="ts">
import { useRafFn } from '@vueuse/core';
import { Flag, Pause, Play, RefreshCw } from 'lucide-vue-next';

import InputCopyable from '@/components/InputCopyable.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolI18n } from '@/composable/useToolI18n';
import { formatMs } from './chronometer.service';

const { t } = useToolI18n()
const isRunning = ref(false)
const counter = ref(0)
const records = ref<number[]>([])

let previousRafDate = Date.now()
const { pause: pauseRaf, resume: resumeRaf } = useRafFn(
  () => {
    const deltaMs = Date.now() - previousRafDate
    previousRafDate = Date.now()
    counter.value += deltaMs
  },
  { immediate: false },
)

function resume() {
  previousRafDate = Date.now()
  resumeRaf()
  isRunning.value = true
}

function pause() {
  pauseRaf()
  isRunning.value = false
}

function addRecord() {
  // record current elapsed time as a record (prepend to show latest first)
  records.value.unshift(counter.value)
}

function clearRecords() {
  records.value = []
}

function resetAll() {
  counter.value = 0
  records.value = []
  isRunning.value = false
  pauseRaf()
}
</script>

<template>
  <div class="space-y-4">
    <Card>
      <CardContent>
        <div class="flex flex-col items-center">
          <div class="duration select-none font-mono">
            {{ formatMs(counter) }}
          </div>

          <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Button v-if="!isRunning" variant="default" size="sm" @click="resume">
              <Play class="mr-2 h-4 w-4" />
              {{ t('tools.chronometer.button.start') }}
            </Button>

            <Button v-else variant="destructive" size="sm" @click="pause">
              <Pause class="mr-2 h-4 w-4" />
              {{ t('tools.chronometer.button.stop') }}
            </Button>

            <Button variant="outline" size="sm" :disabled="!isRunning" @click="addRecord">
              <Flag class="mr-2 h-4 w-4" />
              {{ t('tools.chronometer.button.record', 'Record') }}
            </Button>

            <Button variant="ghost" size="sm" @click="resetAll">
              <RefreshCw class="mr-2 h-4 w-4" />
              {{ t('tools.chronometer.button.reset') }}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card v-if="records.length">
      <CardHeader class="pb-2">
        <div class="flex items-center justify-between w-full">
          <CardTitle class="flex items-center gap-2 text-sm">
            <Flag class="h-4 w-4 text-primary" />
            {{ t('tools.chronometer.records.title', 'Records') }}
          </CardTitle>
          <Button variant="ghost" size="sm" @click="clearRecords">
            {{ t('tools.chronometer.button.clearRecords', 'Clear records') }}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col gap-2">
          <div v-for="(rec, idx) in records" :key="`${rec}-${idx}`" class="flex items-center justify-between gap-2">
            <div class="text-sm text-muted-foreground mr-2">
              #{{ records.length - idx }}
            </div>
            <InputCopyable :value="formatMs(rec)" readonly :field-props="{ class: 'flex-1' }" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style lang="less" scoped>
.duration {
  text-align: center;
  font-size: 36px;
  font-family: monospace;
  margin: 16px 0;
  font-weight: 600;
}
</style>
