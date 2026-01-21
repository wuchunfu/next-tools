<script lang="ts" setup>
import { isEqual, isUndefined } from 'lodash-es';
import { CircleCheck, Diff } from 'lucide-vue-next'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { useToolI18n } from '@/composable/useToolI18n'
import { diff } from '../json-diff.service'
import { DiffRootViewer } from './diff-viewer.service'

const props = defineProps<{ leftJson: unknown, rightJson: unknown }>();
const onlyShowDifferences = ref(false);
const { leftJson, rightJson } = toRefs(props);
const { t } = useToolI18n();

const result = computed(() =>
  diff(leftJson.value, rightJson.value, { onlyShowDifferences: onlyShowDifferences.value }),
);

const jsonAreTheSame = computed(() => isEqual(leftJson.value, rightJson.value));
const showResults = computed(() => !isUndefined(leftJson.value) && !isUndefined(rightJson.value));

const diffViewerClasses = computed(() => {
  return [
    'text-muted-foreground',
    'font-mono',
    'text-sm',
    'leading-[1.2]',
    // Lists and structure
    '[&_ul]:list-none',
    '[&_ul]:pl-0',
    '[&_ul]:m-0',
    '[&_ul_ul]:pl-5',
    '[&_li]:my-0.5',
    '[&_.updated-line]:py-1',
    // Generic result container
    '[&_.result]:inline-block',
    '[&_.result:not(:last-child)]:mr-1',
    // Added / removed line wrappers
    '[&_.result.added]:px-1.5',
    '[&_.result.added]:rounded-sm',
    '[&_.result.added]:bg-green-500/15',
    '[&_.result.added]:text-green-700',
    '[&_.result.added]:font-medium',
    '[&_.result.added]:dark:text-green-500',
    '[&_.result.added_.key]:text-inherit',
    '[&_.result.added_.value]:bg-transparent',
    '[&_.result.removed]:px-1.5',
    '[&_.result.removed]:rounded-sm',
    '[&_.result.removed]:bg-destructive/15',
    '[&_.result.removed]:text-destructive',
    '[&_.result.removed]:font-medium',
    '[&_.result.removed_.key]:text-inherit',
    '[&_.result.removed_.value]:bg-transparent',
    // Array wrappers
    '[&_.array]:inline-block',
    '[&_.array:not(:last-child)]:mr-1',
    '[&_.array.added]:px-1.5',
    '[&_.array.added]:py-0.5',
    '[&_.array.added]:rounded',
    '[&_.array.added]:bg-green-500/15',
    '[&_.array.added]:text-green-700',
    '[&_.array.added]:font-medium',
    '[&_.array.added]:dark:text-green-500',
    '[&_.array.added_.added]:bg-transparent',
    '[&_.array.added_.added]:text-inherit',
    '[&_.array.added_.removed]:bg-transparent',
    '[&_.array.added_.removed]:text-inherit',
    '[&_.array.added_.key]:text-inherit',
    '[&_.array.added_.value]:bg-transparent',
    '[&_.array.removed]:px-1.5',
    '[&_.array.removed]:py-0.5',
    '[&_.array.removed]:rounded',
    '[&_.array.removed]:bg-destructive/15',
    '[&_.array.removed]:text-destructive',
    '[&_.array.removed]:font-medium',
    '[&_.array.removed_.added]:bg-transparent',
    '[&_.array.removed_.added]:text-inherit',
    '[&_.array.removed_.removed]:bg-transparent',
    '[&_.array.removed_.removed]:text-inherit',
    '[&_.array.removed_.key]:text-inherit',
    '[&_.array.removed_.value]:bg-transparent',
    // Object wrappers
    '[&_.object]:inline-block',
    '[&_.object:not(:last-child)]:mr-1',
    '[&_.object.added]:px-1.5',
    '[&_.object.added]:py-0.5',
    '[&_.object.added]:rounded',
    '[&_.object.added]:bg-green-500/15',
    '[&_.object.added]:text-green-700',
    '[&_.object.added]:font-medium',
    '[&_.object.added]:dark:text-green-500',
    '[&_.object.added_.added]:bg-transparent',
    '[&_.object.added_.added]:text-inherit',
    '[&_.object.added_.removed]:bg-transparent',
    '[&_.object.added_.removed]:text-inherit',
    '[&_.object.added_.key]:text-inherit',
    '[&_.object.added_.value]:bg-transparent',
    '[&_.object.removed]:px-1.5',
    '[&_.object.removed]:py-0.5',
    '[&_.object.removed]:rounded',
    '[&_.object.removed]:bg-destructive/15',
    '[&_.object.removed]:text-destructive',
    '[&_.object.removed]:font-medium',
    '[&_.object.removed_.added]:bg-transparent',
    '[&_.object.removed_.added]:text-inherit',
    '[&_.object.removed_.removed]:bg-transparent',
    '[&_.object.removed_.removed]:text-inherit',
    '[&_.object.removed_.key]:text-inherit',
    '[&_.object.removed_.value]:bg-transparent',
    // Value badges
    '[&_.value]:cursor-pointer',
    '[&_.value]:border',
    '[&_.value]:border-transparent',
    '[&_.value]:rounded-sm',
    '[&_.value]:px-1',
    '[&_.value]:py-0.5',
    '[&_.value]:transition-all',
    '[&_.value]:duration-200',
    '[&_.value]:ease-in-out',
    '[&_.value]:inline-block',
    '[&_.value]:font-mono',
    '[&_.value.added]:bg-green-500/20',
    '[&_.value.added]:text-green-700',
    '[&_.value.added]:hover:bg-green-500/30',
    '[&_.value.added]:hover:border-green-700',
    '[&_.value.added]:hover:shadow-sm',
    '[&_.value.added]:hover:shadow-green-500/20',
    '[&_.value.added]:dark:text-green-500',
    '[&_.value.removed]:bg-destructive/20',
    '[&_.value.removed]:text-destructive',
    '[&_.value.removed]:hover:bg-destructive/30',
    '[&_.value.removed]:hover:border-destructive',
    '[&_.value.removed]:hover:shadow-sm',
    '[&_.value.removed]:hover:shadow-destructive/20',
    // Reset inner nested badges
    '[&_.added_.added]:bg-transparent',
    '[&_.added_.added]:text-inherit',
    '[&_.removed_.removed]:bg-transparent',
    '[&_.removed_.removed]:text-inherit',
    // Keys
    '[&_.key]:font-semibold',
    '[&_.key]:text-foreground',
    '[&_.key]:mr-1',
    // Spacing between values with background
    '[&_.value.added:not(:last-child)]:mr-1',
    '[&_.value.removed:not(:last-child)]:mr-1',
  ].join(' ');
})
</script>

<template>
  <Card v-if="showResults" data-testid="diff-result">
    <CardHeader>
      <div class="space-y-1">
        <CardTitle class="flex items-center gap-2">
          <Diff class="h-5 w-5 text-primary" />
          {{ t('tools.json-diff.resultsTitle', 'Comparison Results') }}
        </CardTitle>
        <CardDescription>
          {{ t('tools.json-diff.resultsDescription', 'Differences are highlighted in green (added) and red (removed).') }}
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="flex items-center min-w-0 gap-4">
        <FieldLabel for="only-differences" class="text-sm font-medium">
          {{ t('tools.json-diff.onlyShowDifferences') }}
        </FieldLabel>
        <div class="flex items-center gap-2 shrink-0">
          <Switch id="only-differences" v-model="onlyShowDifferences" />
        </div>
      </div>

      <div v-if="jsonAreTheSame" class="rounded-lg border border-green-500/50 bg-green-500/10 p-6" data-testid="same-json-message">
        <Alert class="border-0 bg-transparent p-0">
          <CircleCheck class="h-5 w-5 text-green-600 dark:text-green-400" />
          <AlertTitle class="text-green-600 dark:text-green-400">
            {{ t('tools.json-diff.sameJson') }}
          </AlertTitle>
          <AlertDescription class="text-green-700/80 dark:text-green-300/80">
            {{ t('tools.json-diff.sameJsonDescription', 'Both JSON objects are identical. No differences found.') }}
          </AlertDescription>
        </Alert>
      </div>
      <div v-else class="rounded-lg border bg-muted/30" data-testid="diff-content">
        <div :class="diffViewerClasses" class="p-4 w-full max-h-150 overflow-y-auto">
          <DiffRootViewer :diff="result" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>
