<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { Keyboard } from 'lucide-vue-next'
import InputCopyable from '@/components/InputCopyable.vue'
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldLabel, FieldSet } from '@/components/ui/field';
import { useToolI18n } from '@/composable/useToolI18n';

const event = ref<KeyboardEvent>()
const { t } = useToolI18n()

useEventListener(document, 'keydown', (e) => {
  event.value = e
});

const locationMap = computed((): Record<number, string> => ({
  0: t('tools.keycode-info.locationStandard', 'Standard'),
  1: t('tools.keycode-info.locationLeft', 'Left'),
  2: t('tools.keycode-info.locationRight', 'Right'),
  3: t('tools.keycode-info.locationNumpad', 'Numpad'),
}))

const keyType = computed(() => {
  if (!event.value) { return '' }
  const key = event.value.key
  if (key.length === 1) {
    return t('tools.keycode-info.typeCharacter', 'Character Key')
  }
  if (['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'].includes(key)) {
    return t('tools.keycode-info.typeFunction', 'Function Key')
  }
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(key)) {
    return t('tools.keycode-info.typeNavigation', 'Navigation Key')
  }
  if (['Enter', 'Tab', 'Backspace', 'Delete', 'Escape'].includes(key)) {
    return t('tools.keycode-info.typeControl', 'Control Key')
  }
  return t('tools.keycode-info.typeSpecial', 'Special Key')
});

const modifiers = computed(() => {
  if (!event.value) { return [] }
  const mods: Array<{ label: string, value: boolean }> = [
    { label: t('tools.keycode-info.meta'), value: event.value.metaKey },
    { label: t('tools.keycode-info.shift'), value: event.value.shiftKey },
    { label: t('tools.keycode-info.ctrl'), value: event.value.ctrlKey },
    { label: t('tools.keycode-info.alt'), value: event.value.altKey },
  ]
  return mods.filter(m => m.value)
});

const fields = computed(() => {
  if (!event.value) {
    return []
  }

  return [
    {
      label: t('tools.keycode-info.key'),
      value: event.value.key || t('tools.keycode-info.unknown', 'Unknown'),
      placeholder: t('tools.keycode-info.keyPlaceholder'),
    },
    {
      label: t('tools.keycode-info.code'),
      value: event.value.code,
      placeholder: t('tools.keycode-info.codePlaceholder'),
    },
    {
      label: t('tools.keycode-info.keycode'),
      value: String(event.value.keyCode),
      placeholder: t('tools.keycode-info.keycodePlaceholder'),
    },
    {
      label: t('tools.keycode-info.charCode'),
      value: event.value.charCode ? String(event.value.charCode) : t('tools.keycode-info.none'),
      placeholder: t('tools.keycode-info.charCodePlaceholder'),
    },
    {
      label: t('tools.keycode-info.location'),
      value: locationMap.value[event.value.location] || String(event.value.location),
      placeholder: t('tools.keycode-info.locationPlaceholder'),
    },
    {
      label: t('tools.keycode-info.repeat'),
      value: event.value.repeat ? t('tools.keycode-info.yes', 'Yes') : t('tools.keycode-info.no', 'No'),
      placeholder: t('tools.keycode-info.repeatPlaceholder'),
    },
  ]
});
</script>

<template>
  <div class="space-y-6">
    <Card class="border-primary/30 bg-primary/5">
      <CardHeader class="pb-4">
        <CardTitle class="flex items-center gap-2">
          <Keyboard class="h-5 w-5 text-primary" />
          {{ t('tools.keycode-info.cardTitle', 'Keyboard Key Information') }}
        </CardTitle>
        <CardDescription>
          {{ t('tools.keycode-info.cardDescription', 'Press any key on your keyboard to see its detailed information.') }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="event" class="space-y-6">
          <!-- Key Display -->
          <div class="flex flex-col items-center gap-4">
            <div class="relative">
              <div
                class="flex h-32 w-32 items-center justify-center rounded-xl border-2 border-primary/50 bg-primary/10 text-5xl font-bold shadow-lg transition-all hover:scale-105"
              >
                <span v-if="event.key && event.key.length === 1" class="text-primary">
                  {{ event.key }}
                </span>
                <span v-else class="text-sm text-primary">
                  {{ event.key || '?' }}
                </span>
              </div>
              <Badge
                v-if="keyType"
                class="absolute -right-2 -top-2"
                variant="secondary"
              >
                {{ keyType }}
              </Badge>
            </div>

            <!-- Modifiers -->
            <div v-if="modifiers.length > 0" class="flex flex-wrap items-center justify-center gap-2">
              <span class="text-sm text-muted-foreground">
                {{ t('tools.keycode-info.modifiers') }}
              </span>
              <div class="flex flex-wrap gap-2">
                <Badge
                  v-for="{ label } in modifiers"
                  :key="label"
                  variant="outline"
                  class="font-mono"
                >
                  {{ label }}
                </Badge>
              </div>
            </div>
            <div v-else class="text-sm text-muted-foreground">
              {{ t('tools.keycode-info.noModifiers', 'No modifiers pressed') }}
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col items-center gap-4 py-12">
          <div class="flex h-32 w-32 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30">
            <Keyboard class="h-12 w-12 text-muted-foreground/50" />
          </div>
          <p class="text-center text-sm text-muted-foreground">
            {{ t('tools.keycode-info.tip') }}
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Details Card -->
    <Card v-if="event">
      <CardHeader>
        <CardTitle class="text-lg">
          {{ t('tools.keycode-info.detailsTitle', 'Key Details') }}
        </CardTitle>
        <CardDescription>
          {{ t('tools.keycode-info.detailsDescription', 'Detailed information about the pressed key.') }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldSet class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            v-for="({ label, value, placeholder }, i) in fields"
            :key="i"
            orientation="vertical"
            class="gap-2"
          >
            <FieldLabel class="text-sm font-medium">
              {{ label }}
            </FieldLabel>
            <FieldContent>
              <InputCopyable
                :value="value"
                readonly
                :placeholder="placeholder"
              />
            </FieldContent>
          </Field>
        </FieldSet>
      </CardContent>
    </Card>
  </div>
</template>
