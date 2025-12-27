<script setup lang="ts">
import { chain, identity } from 'lodash'
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToolI18n } from '@/composable/useToolI18n';
import {
  convertCelsiusToKelvin,
  convertDelisleToKelvin,
  convertFahrenheitToKelvin,
  convertKelvinToCelsius,
  convertKelvinToDelisle,
  convertKelvinToFahrenheit,
  convertKelvinToNewton,
  convertKelvinToRankine,
  convertKelvinToReaumur,
  convertKelvinToRomer,
  convertNewtonToKelvin,
  convertRankineToKelvin,
  convertReaumurToKelvin,
  convertRomerToKelvin,
} from './temperature-converter.models'

type TemperatureScale = 'kelvin' | 'celsius' | 'fahrenheit' | 'rankine' | 'delisle' | 'newton' | 'reaumur' | 'romer'

const units = reactive<
  Record<
    string | TemperatureScale,
    { title: string, unit: string, ref: number, toKelvin: (v: number) => number, fromKelvin: (v: number) => number }
  >
>({
        kelvin: {
          title: 'Kelvin',
          unit: 'K',
          ref: 0,
          toKelvin: identity,
          fromKelvin: identity,
        },
        celsius: {
          title: 'Celsius',
          unit: '°C',
          ref: 0,
          toKelvin: convertCelsiusToKelvin,
          fromKelvin: convertKelvinToCelsius,
        },
        fahrenheit: {
          title: 'Fahrenheit',
          unit: '°F',
          ref: 0,
          toKelvin: convertFahrenheitToKelvin,
          fromKelvin: convertKelvinToFahrenheit,
        },
        rankine: {
          title: 'Rankine',
          unit: '°R',
          ref: 0,
          toKelvin: convertRankineToKelvin,
          fromKelvin: convertKelvinToRankine,
        },
        delisle: {
          title: 'Delisle',
          unit: '°De',
          ref: 0,
          toKelvin: convertDelisleToKelvin,
          fromKelvin: convertKelvinToDelisle,
        },
        newton: {
          title: 'Newton',
          unit: '°N',
          ref: 0,
          toKelvin: convertNewtonToKelvin,
          fromKelvin: convertKelvinToNewton,
        },
        reaumur: {
          title: 'Réaumur',
          unit: '°Ré',
          ref: 0,
          toKelvin: convertReaumurToKelvin,
          fromKelvin: convertKelvinToReaumur,
        },
        romer: {
          title: 'Rømer',
          unit: '°Rø',
          ref: 0,
          toKelvin: convertRomerToKelvin,
          fromKelvin: convertKelvinToRomer,
        },
      })

const { t } = useToolI18n()

// 更新温度单位标签
const temperatureLabels = computed(() => ({
  kelvin: t('tools.temperature-converter.kelvin'),
  celsius: t('tools.temperature-converter.celsius'),
  fahrenheit: t('tools.temperature-converter.fahrenheit'),
  rankine: t('tools.temperature-converter.rankine'),
  delisle: t('tools.temperature-converter.delisle'),
  newton: t('tools.temperature-converter.newton'),
  reaumur: t('tools.temperature-converter.reaumur'),
  romer: t('tools.temperature-converter.romer'),
}))

function update(key: TemperatureScale) {
  const { ref: value, toKelvin } = units[key] as { ref: number, toKelvin: (v: number) => number }

  const kelvins = toKelvin(value) ?? 0

  chain(units)
    .omit(key)
    .forEach(({ fromKelvin }, index) => {
      units[index]!.ref = Math.floor((fromKelvin(kelvins) ?? 0) * 100) / 100
    })
    .value()
}

update('kelvin')
</script>

<template>
  <Card>
    <CardContent>
      <FieldGroup class="grid gap-4 md:grid-cols-2">
        <template v-for="[key, { unit }] in Object.entries(units)" :key="key">
          <Field>
            <FieldLabel>{{ temperatureLabels[key as TemperatureScale] }}</FieldLabel>
            <FieldContent>
              <div class="flex items-center gap-4 w-full">
                <Input
                  v-model.number="units[key]!.ref"
                  type="number"
                  step="any"
                  class="flex-1"
                  @input="() => update(key as TemperatureScale)"
                />
                <div class="text-sm text-muted-foreground w-6 text-left">
                  {{ unit }}
                </div>
              </div>
            </FieldContent>
          </Field>
        </template>
      </FieldGroup>
    </CardContent>
  </Card>
</template>
