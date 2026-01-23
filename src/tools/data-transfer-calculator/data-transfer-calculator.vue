<script setup lang="ts">
import { Calculator, Clock, HardDrive, Info, Languages, Zap } from 'lucide-vue-next';
import { useStorage } from '@vueuse/core';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToolI18n } from '@/composable/useToolI18n';
import {
  calculateTransferTime,
  calculateRequiredSpeed,
  calculateTransferableSize,
  parseDurationForDisplay
} from './data-transfer-calculator.service';
import type {DataSizeUnit, TransferSpeedUnit, DurationPart} from './data-transfer-calculator.service';

const { t } = useToolI18n();

type CalculationMode = 'calculate-time' | 'calculate-speed' | 'calculate-size';

const calculationMode = useStorage<CalculationMode>('data-transfer-calculator:calculation-mode', 'calculate-time');
const useOriginalUnits = useStorage<boolean>('data-transfer-calculator:use-original-units', true);

// Input values
const dataSize = useStorage<number>('data-transfer-calculator:data-size', 1);
const dataSizeUnit = useStorage<DataSizeUnit>('data-transfer-calculator:data-size-unit', 'gigabyte');
const transferSpeed = useStorage<number>('data-transfer-calculator:transfer-speed', 100);
const transferSpeedUnit = useStorage<TransferSpeedUnit>('data-transfer-calculator:transfer-speed-unit', 'Mbit/s');
const transferTime = useStorage<number>('data-transfer-calculator:transfer-time', 60);
const transferTimeUnit = useStorage<'seconds' | 'minutes' | 'hours' | 'days'>('data-transfer-calculator:transfer-time-unit', 'seconds');

const dataSizeOptions = computed(() => {
  if (useOriginalUnits.value) {
    return [
      { label: 'Bit', value: 'bit' },
      { label: 'Byte', value: 'byte' },
      { label: 'Kilobyte (KB)', value: 'kilobyte' },
      { label: 'Megabyte (MB)', value: 'megabyte' },
      { label: 'Gigabyte (GB)', value: 'gigabyte' },
      { label: 'Terabyte (TB)', value: 'terabyte' },
      { label: 'Petabyte (PB)', value: 'petabyte' },
    ];
  }
  return [
    { label: t('tools.data-transfer-calculator.bit', 'Bit'), value: 'bit' },
    { label: t('tools.data-transfer-calculator.byte', 'Byte'), value: 'byte' },
    { label: t('tools.data-transfer-calculator.kilobyte', 'Kilobyte (KB)'), value: 'kilobyte' },
    { label: t('tools.data-transfer-calculator.megabyte', 'Megabyte (MB)'), value: 'megabyte' },
    { label: t('tools.data-transfer-calculator.gigabyte', 'Gigabyte (GB)'), value: 'gigabyte' },
    { label: t('tools.data-transfer-calculator.terabyte', 'Terabyte (TB)'), value: 'terabyte' },
    { label: t('tools.data-transfer-calculator.petabyte', 'Petabyte (PB)'), value: 'petabyte' },
  ];
});

const transferSpeedOptions = computed(() => {
  if (useOriginalUnits.value) {
    return [
      { label: 'bit/s', value: 'bit/s' },
      { label: 'kbit/s', value: 'kbit/s' },
      { label: 'Mbit/s', value: 'Mbit/s' },
      { label: 'Gbit/s', value: 'Gbit/s' },
      { label: 'Byte/s', value: 'byte/s' },
      { label: 'KB/s', value: 'KB/s' },
      { label: 'MB/s', value: 'MB/s' },
      { label: 'GB/s', value: 'GB/s' },
    ];
  }
  return [
    { label: t('tools.data-transfer-calculator.bit-per-second', 'bit/s'), value: 'bit/s' },
    { label: t('tools.data-transfer-calculator.kbit-per-second', 'kbit/s'), value: 'kbit/s' },
    { label: t('tools.data-transfer-calculator.mbit-per-second', 'Mbit/s'), value: 'Mbit/s' },
    { label: t('tools.data-transfer-calculator.gbit-per-second', 'Gbit/s'), value: 'Gbit/s' },
    { label: t('tools.data-transfer-calculator.byte-per-second', 'Byte/s'), value: 'byte/s' },
    { label: t('tools.data-transfer-calculator.kb-per-second', 'KB/s'), value: 'KB/s' },
    { label: t('tools.data-transfer-calculator.mb-per-second', 'MB/s'), value: 'MB/s' },
    { label: t('tools.data-transfer-calculator.gb-per-second', 'GB/s'), value: 'GB/s' },
  ];
});

const timeUnitOptions = computed(() => [
  { label: t('tools.data-transfer-calculator.seconds', 'Seconds'), value: 'seconds' },
  { label: t('tools.data-transfer-calculator.minutes', 'Minutes'), value: 'minutes' },
  { label: t('tools.data-transfer-calculator.hours', 'Hours'), value: 'hours' },
  { label: t('tools.data-transfer-calculator.days', 'Days'), value: 'days' },
]);

const timeUnitMultipliers = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400,
};

const formatLocalizedDuration = (durationParts: DurationPart[]): string => {
  return durationParts.map(part => 
    `${part.value} ${t(`tools.data-transfer-calculator.${part.unit}`, part.unit)}`
  ).join(' ');
};

const result = computed(() => {
  if (calculationMode.value === 'calculate-time') {
    if (dataSize.value <= 0 || transferSpeed.value <= 0) {
      return null;
    }

    const timeResult = calculateTransferTime({
      dataSize: dataSize.value,
      dataSizeUnit: dataSizeUnit.value,
      transferSpeed: transferSpeed.value,
      transferSpeedUnit: transferSpeedUnit.value,
    });

    const durationParts = parseDurationForDisplay(timeResult.timeInSeconds);

    return {
      type: 'time' as const,
      ...timeResult,
      formattedTime: formatLocalizedDuration(durationParts),
    };
  }
  else if (calculationMode.value === 'calculate-speed') {
    if (dataSize.value <= 0 || transferTime.value <= 0) {
      return null;
    }

    const timeInSeconds = transferTime.value * timeUnitMultipliers[transferTimeUnit.value];
    const speedInBytesPerSecond = calculateRequiredSpeed(
      dataSize.value,
      dataSizeUnit.value,
      timeInSeconds,
    );

    return {
      type: 'speed' as const,
      speedInBytesPerSecond,
      speedInKBps: speedInBytesPerSecond / 1024,
      speedInMBps: speedInBytesPerSecond / (1024 ** 2),
      speedInGBps: speedInBytesPerSecond / (1024 ** 3),
      speedInMbitps: (speedInBytesPerSecond * 8) / (1000 ** 2),
      speedInGbitps: (speedInBytesPerSecond * 8) / (1000 ** 3),
    };
  }
  else {
    // calculate-size
    if (transferSpeed.value <= 0 || transferTime.value <= 0) {
      return null;
    }

    const timeInSeconds = transferTime.value * timeUnitMultipliers[transferTimeUnit.value];
    const sizeInBytes = calculateTransferableSize(
      transferSpeed.value,
      transferSpeedUnit.value,
      timeInSeconds,
    );

    return {
      type: 'size' as const,
      sizeInBytes,
      sizeInKB: sizeInBytes / 1024,
      sizeInMB: sizeInBytes / (1024 ** 2),
      sizeInGB: sizeInBytes / (1024 ** 3),
      sizeInTB: sizeInBytes / (1024 ** 4),
    };
  }
});

const selectedDataSizeLabel = computed(() => {
  const option = dataSizeOptions.value.find(opt => opt.value === dataSizeUnit.value);
  return option?.label || '';
});

const selectedTransferSpeedLabel = computed(() => {
  const option = transferSpeedOptions.value.find(opt => opt.value === transferSpeedUnit.value);
  return option?.label || '';
});

const selectedTimeUnitLabel = computed(() => {
  const option = timeUnitOptions.value.find(opt => opt.value === transferTimeUnit.value);
  return option?.label || '';
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <Alert class="border-primary/40 bg-primary/10">
      <Info class="h-4 w-4 text-primary" />
      <AlertTitle class="text-sm">
        {{ t('tools.data-transfer-calculator.info-title', 'Data Transfer Calculator') }}
      </AlertTitle>
      <AlertDescription class="text-xs">
        {{
          t(
            'tools.data-transfer-calculator.info-description',
            'Calculate transfer time, required speed, or transferable data size. Choose what you want to calculate and enter the known values.',
          )
        }}
      </AlertDescription>
    </Alert>

    <Card>
      <CardHeader class="pb-4">
        <div class="space-y-3">
          <CardTitle class="flex items-center gap-2">
            <Calculator class="h-5 w-5 text-primary" />
            {{ t('tools.data-transfer-calculator.calculation-mode', 'What do you want to calculate?') }}
          </CardTitle>
          <RadioGroup v-model="calculationMode" class="grid gap-3 md:grid-cols-3">
            <div data-testid="mode-calculate-time" class="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent cursor-pointer" :class="{ 'border-primary bg-primary/5': calculationMode === 'calculate-time' }">
              <Label for="mode-time" class="flex items-center gap-2 cursor-pointer flex-1">
                <Clock class="h-4 w-4" />
                {{ t('tools.data-transfer-calculator.calculate-time', 'Transfer Time') }}
              </Label>
              <RadioGroupItem id="mode-time" value="calculate-time" />
            </div>
            <div data-testid="mode-calculate-speed" class="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent cursor-pointer" :class="{ 'border-primary bg-primary/5': calculationMode === 'calculate-speed' }">
              <Label for="mode-speed" class="flex items-center gap-2 cursor-pointer flex-1">
                <Zap class="h-4 w-4" />
                {{ t('tools.data-transfer-calculator.calculate-speed', 'Transfer Speed') }}
              </Label>
              <RadioGroupItem id="mode-speed" value="calculate-speed" />
            </div>
            <div data-testid="mode-calculate-size" class="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent cursor-pointer" :class="{ 'border-primary bg-primary/5': calculationMode === 'calculate-size' }">
              <Label for="mode-size" class="flex items-center gap-2 cursor-pointer flex-1">
                <HardDrive class="h-4 w-4" />
                {{ t('tools.data-transfer-calculator.calculate-size', 'Data Size') }}
              </Label>
              <RadioGroupItem id="mode-size" value="calculate-size" />
            </div>
          </RadioGroup>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Unit Display Toggle -->
        <div class="flex items-center justify-between gap-4 p-4 rounded-lg border bg-muted/50">
          <div class="flex items-center gap-2">
            <Languages class="h-4 w-4 text-muted-foreground" />
            <div class="flex flex-col">
              <Label for="unit-toggle" class="text-sm font-medium cursor-pointer">
                {{ t('tools.data-transfer-calculator.use-original-units', 'Use original unit names') }}
              </Label>
              <span class="text-xs text-muted-foreground">
                {{ t('tools.data-transfer-calculator.use-original-units-description', 'Display units in English instead of translated names') }}
              </span>
            </div>
          </div>
          <Switch id="unit-toggle" v-model="useOriginalUnits" data-testid="unit-toggle" />
        </div>

        <FieldGroup class="gap-4">
          <!-- Data Size Input (hidden when calculating size) -->
          <Field v-if="calculationMode !== 'calculate-size'">
            <FieldLabel class="flex items-center gap-2">
              <HardDrive class="h-4 w-4" />
              {{ t('tools.data-transfer-calculator.data-size-label', 'Data Size') }}
            </FieldLabel>
            <FieldContent>
              <div class="flex flex-col gap-3 md:flex-row md:items-center">
                <Input
                  v-model.number="dataSize"
                  type="number"
                  :min="0"
                  step="any"
                  class="flex-1"
                  data-testid="data-size-input"
                  :placeholder="t('tools.data-transfer-calculator.data-size-placeholder', 'Enter data size')"
                />
                <Select
                  :model-value="dataSizeUnit"
                  @update:model-value="value => (dataSizeUnit = value as DataSizeUnit)"
                >
                  <SelectTrigger class="w-full md:w-48" data-testid="data-size-unit-select">
                    <SelectValue>{{ selectedDataSizeLabel }}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="opt in dataSizeOptions"
                        :key="opt.value"
                        :value="opt.value"
                      >
                        {{ opt.label }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </FieldContent>
          </Field>

          <!-- Transfer Speed Input (hidden when calculating speed) -->
          <Field v-if="calculationMode !== 'calculate-speed'">
            <FieldLabel class="flex items-center gap-2">
              <Zap class="h-4 w-4" />
              {{ t('tools.data-transfer-calculator.transfer-speed-label', 'Transfer Speed') }}
            </FieldLabel>
            <FieldContent>
              <div class="flex flex-col gap-3 md:flex-row md:items-center">
                <Input
                  v-model.number="transferSpeed"
                  type="number"
                  :min="0"
                  step="any"
                  class="flex-1"
                  data-testid="transfer-speed-input"
                  :placeholder="t('tools.data-transfer-calculator.transfer-speed-placeholder', 'Enter transfer speed')"
                />
                <Select
                  :model-value="transferSpeedUnit"
                  @update:model-value="value => (transferSpeedUnit = value as TransferSpeedUnit)"
                >
                  <SelectTrigger class="w-full md:w-48" data-testid="transfer-speed-unit-select">
                    <SelectValue>{{ selectedTransferSpeedLabel }}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="opt in transferSpeedOptions"
                        :key="opt.value"
                        :value="opt.value"
                      >
                        {{ opt.label }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </FieldContent>
          </Field>

          <!-- Transfer Time Input (hidden when calculating time) -->
          <Field v-if="calculationMode !== 'calculate-time'">
            <FieldLabel class="flex items-center gap-2">
              <Clock class="h-4 w-4" />
              {{ t('tools.data-transfer-calculator.transfer-time-label', 'Transfer Time') }}
            </FieldLabel>
            <FieldContent>
              <div class="flex flex-col gap-3 md:flex-row md:items-center">
                <Input
                  v-model.number="transferTime"
                  type="number"
                  :min="0"
                  step="any"
                  class="flex-1"
                  data-testid="transfer-time-input"
                  :placeholder="t('tools.data-transfer-calculator.transfer-time-placeholder', 'Enter transfer time')"
                />
                <Select
                  :model-value="transferTimeUnit"
                  @update:model-value="value => (transferTimeUnit = value as typeof transferTimeUnit)"
                >
                  <SelectTrigger class="w-full md:w-48" data-testid="transfer-time-unit-select">
                    <SelectValue>{{ selectedTimeUnitLabel }}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="opt in timeUnitOptions"
                        :key="opt.value"
                        :value="opt.value"
                      >
                        {{ opt.label }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <!-- Results Card -->
    <Card v-if="result" data-testid="result-card" class="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader class="pb-4">
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Calculator class="h-5 w-5 text-primary" />
            {{ t('tools.data-transfer-calculator.result-title', 'Calculation Result') }}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Time Results -->
        <div v-if="result.type === 'time'" class="grid gap-4 md:grid-cols-2">
          <div class="rounded-lg border bg-card p-4 md:col-span-2" data-testid="formatted-time">
            <div class="text-sm text-muted-foreground mb-1">
              {{ t('tools.data-transfer-calculator.formatted-time', 'Formatted Time') }}
            </div>
            <div class="text-2xl font-bold text-primary">
              {{ result.formattedTime }}
            </div>
          </div>

          <div class="rounded-lg border bg-card p-4" data-testid="time-in-seconds">
            <div class="text-sm text-muted-foreground mb-1">
              {{ t('tools.data-transfer-calculator.in-seconds', 'In Seconds') }}
            </div>
            <div class="text-xl font-bold">
              {{ result.timeInSeconds.toFixed(2) }} {{ t('tools.data-transfer-calculator.seconds', 'Seconds') }}
            </div>
          </div>

          <div class="rounded-lg border bg-card p-4" data-testid="time-in-minutes">
            <div class="text-sm text-muted-foreground mb-1">
              {{ t('tools.data-transfer-calculator.in-minutes', 'In Minutes') }}
            </div>
            <div class="text-xl font-bold">
              {{ result.timeInMinutes.toFixed(2) }} {{ t('tools.data-transfer-calculator.minutes', 'Minutes') }}
            </div>
          </div>

          <div class="rounded-lg border bg-card p-4" data-testid="time-in-hours">
            <div class="text-sm text-muted-foreground mb-1">
              {{ t('tools.data-transfer-calculator.in-hours', 'In Hours') }}
            </div>
            <div class="text-xl font-bold">
              {{ result.timeInHours.toFixed(2) }} {{ t('tools.data-transfer-calculator.hours', 'Hours') }}
            </div>
          </div>

          <div class="rounded-lg border bg-card p-4" data-testid="time-in-days">
            <div class="text-sm text-muted-foreground mb-1">
              {{ t('tools.data-transfer-calculator.in-days', 'In Days') }}
            </div>
            <div class="text-xl font-bold">
              {{ result.timeInDays.toFixed(2) }} {{ t('tools.data-transfer-calculator.days', 'Days') }}
            </div>
          </div>
        </div>

        <!-- Speed Results -->
        <div v-if="result.type === 'speed'" class="grid gap-4 md:grid-cols-2">
          <div class="rounded-lg border bg-card p-4" data-testid="speed-mbps">
            <div class="text-sm text-muted-foreground mb-1">
              {{ useOriginalUnits ? 'MB/s' : t('tools.data-transfer-calculator.speed-mb-per-second', 'MB/s') }}
            </div>
            <div class="text-xl font-bold">
              {{ result.speedInMBps.toFixed(2) }}
            </div>
          </div>

          <div class="rounded-lg border bg-card p-4" data-testid="speed-mbitps">
            <div class="text-sm text-muted-foreground mb-1">
              {{ useOriginalUnits ? 'Mbit/s' : t('tools.data-transfer-calculator.speed-mbit-per-second', 'Mbit/s') }}
            </div>
            <div class="text-xl font-bold">
              {{ result.speedInMbitps.toFixed(2) }}
            </div>
          </div>

          <div class="rounded-lg border bg-card p-4">
            <div class="text-sm text-muted-foreground mb-1">
              {{ useOriginalUnits ? 'KB/s' : t('tools.data-transfer-calculator.speed-kb-per-second', 'KB/s') }}
            </div>
            <div class="text-xl font-bold">
              {{ result.speedInKBps.toFixed(2) }}
            </div>
          </div>

          <div class="rounded-lg border bg-card p-4">
            <div class="text-sm text-muted-foreground mb-1">
              {{ useOriginalUnits ? 'GB/s' : t('tools.data-transfer-calculator.speed-gb-per-second', 'GB/s') }}
            </div>
            <div class="text-xl font-bold">
              {{ result.speedInGBps.toFixed(4) }}
            </div>
          </div>

          <div class="rounded-lg border bg-card p-4">
            <div class="text-sm text-muted-foreground mb-1">
              {{ useOriginalUnits ? 'Gbit/s' : t('tools.data-transfer-calculator.speed-gbit-per-second', 'Gbit/s') }}
            </div>
            <div class="text-xl font-bold">
              {{ result.speedInGbitps.toFixed(4) }}
            </div>
          </div>

          <div class="rounded-lg border bg-card p-4">
            <div class="text-sm text-muted-foreground mb-1">
              {{ useOriginalUnits ? 'Byte/s' : t('tools.data-transfer-calculator.speed-bytes-per-second', 'Byte/s') }}
            </div>
            <div class="text-xl font-bold">
              {{ result.speedInBytesPerSecond.toFixed(0) }}
            </div>
          </div>
        </div>

        <!-- Size Results -->
        <div v-if="result.type === 'size'" class="grid gap-4 md:grid-cols-2">
          <div class="rounded-lg border bg-card p-4" data-testid="size-gb">
            <div class="text-sm text-muted-foreground mb-1">
              {{ useOriginalUnits ? 'Gigabytes (GB)' : t('tools.data-transfer-calculator.size-gb', 'Gigabytes (GB)') }}
            </div>
            <div class="text-xl font-bold">
              {{ result.sizeInGB.toFixed(2) }}
            </div>
          </div>

          <div class="rounded-lg border bg-card p-4" data-testid="size-mb">
            <div class="text-sm text-muted-foreground mb-1">
              {{ useOriginalUnits ? 'Megabytes (MB)' : t('tools.data-transfer-calculator.size-mb', 'Megabytes (MB)') }}
            </div>
            <div class="text-xl font-bold">
              {{ result.sizeInMB.toFixed(2) }}
            </div>
          </div>

          <div class="rounded-lg border bg-card p-4">
            <div class="text-sm text-muted-foreground mb-1">
              {{ useOriginalUnits ? 'Kilobytes (KB)' : t('tools.data-transfer-calculator.size-kb', 'Kilobytes (KB)') }}
            </div>
            <div class="text-xl font-bold">
              {{ result.sizeInKB.toFixed(2) }}
            </div>
          </div>

          <div class="rounded-lg border bg-card p-4">
            <div class="text-sm text-muted-foreground mb-1">
              {{ useOriginalUnits ? 'Terabytes (TB)' : t('tools.data-transfer-calculator.size-tb', 'Terabytes (TB)') }}
            </div>
            <div class="text-xl font-bold">
              {{ result.sizeInTB.toFixed(4) }}
            </div>
          </div>

          <div class="rounded-lg border bg-card p-4 md:col-span-2">
            <div class="text-sm text-muted-foreground mb-1">
              {{ useOriginalUnits ? 'Bytes' : t('tools.data-transfer-calculator.size-bytes', 'Bytes') }}
            </div>
            <div class="text-xl font-bold">
              {{ result.sizeInBytes.toFixed(0) }}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
