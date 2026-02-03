<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { ArrowLeftRight, Settings, Space, ArrowRightToLine, X } from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToolI18n } from '@/composable/useToolI18n';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { analyzeText, convertTabsToSpaces, convertSpacesToTabs } from './tabs-to-spaces.service';

const { t } = useToolI18n();

// Tab width configuration (persisted)
const tabWidth = useStorage('tabs-to-spaces:tab-width', 4);
const tabWidthOptions = [2, 4, 8];

// Spaces to Tabs configuration (persisted)
const leadingOnly = useStorage('tabs-to-spaces:leading-only', true);

// Tabs to Spaces (persisted input)
const tabsInput = useStorage('tabs-to-spaces:tabs-input', '');
const spacesOutput = computed(() => {
  try {
    return convertTabsToSpaces(tabsInput.value, tabWidth.value);
  } catch {
    return '';
  }
});

// Spaces to Tabs (persisted input)
const spacesInput = useStorage('tabs-to-spaces:spaces-input', '');
const tabsOutput = computed(() => {
  try {
    return convertSpacesToTabs(spacesInput.value, tabWidth.value, leadingOnly.value);
  } catch {
    return '';
  }
});

// Statistics for tabs input
const tabsInputStats = computed(() => analyzeText(tabsInput.value));
const spacesOutputStats = computed(() => analyzeText(spacesOutput.value));

// Statistics for spaces input
const spacesInputStats = computed(() => analyzeText(spacesInput.value));
const tabsOutputStats = computed(() => analyzeText(tabsOutput.value));

function clearTabsInput() {
  tabsInput.value = '';
}

function clearSpacesInput() {
  spacesInput.value = '';
}

function setTabWidth(width: number) {
  tabWidth.value = width;
}

// Load example for tabs to spaces
function loadTabsExample() {
  tabsInput.value = `function example() {\n\tif (condition) {\n\t\tconsole.log("Hello");\n\t}\n\treturn\ttrue;\n}`;
}

// Load example for spaces to tabs
function loadSpacesExample() {
  spacesInput.value = `function example() {\n    if (condition) {\n        console.log("Hello");\n    }\n    return    true;\n}`;
}

// Handle Tab key press in textarea to insert actual tab character
function handleTabKeyForTabs(event: KeyboardEvent) {
  if (event.key === 'Tab') {
    event.preventDefault();
    const target = event.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const currentValue = tabsInput.value;
    
    // Insert tab character at cursor position
    // Note: This approach doesn't preserve native undo/redo history
    // Modern browsers don't have a standard API for this yet
    tabsInput.value = `${currentValue.substring(0, start)}\t${currentValue.substring(end)}`;
    
    // Move cursor after the inserted tab
    nextTick(() => {
      target.selectionStart = target.selectionEnd = start + 1;
    });
  }
}

// Handle Tab key press in spaces input textarea
function handleTabKeyForSpaces(event: KeyboardEvent) {
  if (event.key === 'Tab') {
    event.preventDefault();
    const target = event.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const currentValue = spacesInput.value;
    
    // Insert tab character at cursor position
    spacesInput.value = `${currentValue.substring(0, start)}\t${currentValue.substring(end)}`;
    
    // Move cursor after the inserted tab
    nextTick(() => {
      target.selectionStart = target.selectionEnd = start + 1;
    });
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Configuration Card -->
    <Card class="gap-2">
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Settings class="h-5 w-5 text-primary" />
            {{ t('tools.tabs-to-spaces.configTitle', 'Configuration') }}
          </CardTitle>
          <CardDescription>
            {{ t('tools.tabs-to-spaces.configDescription', 'Set the tab width (tab stop interval) for conversion.') }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FieldSet>
          <Field orientation="vertical" class="gap-3">
            <FieldLabel class="text-sm font-medium">
              {{ t('tools.tabs-to-spaces.tabWidthLabel', 'Tab Width') }}
            </FieldLabel>
            <div class="flex items-center gap-3">
              <div class="flex gap-2">
                <Button
                  v-for="width in tabWidthOptions"
                  :key="width"
                  :variant="tabWidth === width ? 'default' : 'outline'"
                  size="sm"
                  @click="setTabWidth(width)"
                >
                  {{ width }}
                </Button>
              </div>
              <div class="flex items-center gap-2">
                <Label for="custom-tab-width" class="text-sm text-muted-foreground">
                  {{ t('tools.tabs-to-spaces.customLabel', 'Custom:') }}
                </Label>
                <Input
                  id="custom-tab-width"
                  v-model.number="tabWidth"
                  type="number"
                  min="1"
                  max="16"
                  class="w-20"
                />
              </div>
            </div>
          </Field>
        </FieldSet>
      </CardContent>
    </Card>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Tabs to Spaces -->
      <Card class="h-full gap-2">
        <CardHeader>
          <div class="space-y-1">
            <CardTitle class="flex items-center gap-2">
              <ArrowRightToLine class="h-5 w-5 text-primary" />
              {{ t('tools.tabs-to-spaces.tabsToSpacesTitle', 'Tabs to Spaces') }}
            </CardTitle>
            <CardDescription>
              {{ t('tools.tabs-to-spaces.tabsToSpacesDescription', 'Convert tab characters to spaces based on tab stop semantics.') }}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent class="space-y-5">
          <FieldSet>
            <Field orientation="vertical" class="gap-3">
              <div class="flex items-center justify-between">
                <FieldLabel class="text-sm font-medium">
                  {{ t('tools.tabs-to-spaces.inputWithTabs', 'Input (with tabs)') }}
                </FieldLabel>
                <div class="flex items-center gap-2">
                  <Badge v-if="tabsInputStats.tabCount > 0" variant="default" class="text-xs">
                    <ArrowRightToLine class="mr-1 h-3 w-3" />
                    {{ tabsInputStats.tabCount }}
                  </Badge>
                  <Badge v-if="tabsInputStats.spaceCount > 0" variant="secondary" class="text-xs">
                    <Space class="mr-1 h-3 w-3" />
                    {{ tabsInputStats.spaceCount }}
                  </Badge>
                  <Badge v-if="tabsInputStats.totalChars > 0" variant="outline" class="text-xs">
                    {{ t('tools.tabs-to-spaces.chars', 'Chars') }}: {{ tabsInputStats.totalChars }}
                  </Badge>
                </div>
              </div>
              <Textarea
                v-model="tabsInput"
                :placeholder="t('tools.tabs-to-spaces.tabsPlaceholder', 'Paste text with tabs here...')"
                rows="8"
                class="max-h-96 resize-y overflow-y-auto font-mono text-sm"
                data-testid="tabs-input"
                @keydown="handleTabKeyForTabs"
              />
              <div class="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" @click="clearTabsInput">
                  <X class="mr-2 h-4 w-4" />
                  {{ t('common.clear', 'Clear') }}
                </Button>
                <Button size="sm" variant="outline" @click="loadTabsExample">
                  {{ t('tools.tabs-to-spaces.loadExample', 'Load Example') }}
                </Button>
              </div>
            </Field>

            <Separator />

            <Field orientation="vertical" class="gap-3">
              <div class="flex items-center justify-between">
                <FieldLabel class="text-sm font-medium">
                  {{ t('tools.tabs-to-spaces.outputWithSpaces', 'Output (with spaces)') }}
                </FieldLabel>
                <div class="flex items-center gap-2">
                  <Badge v-if="spacesOutputStats.tabCount > 0" variant="default" class="text-xs">
                    <ArrowRightToLine class="mr-1 h-3 w-3" />
                    {{ spacesOutputStats.tabCount }}
                  </Badge>
                  <Badge v-if="spacesOutputStats.spaceCount > 0" variant="secondary" class="text-xs">
                    <Space class="mr-1 h-3 w-3" />
                    {{ spacesOutputStats.spaceCount }}
                  </Badge>
                  <Badge v-if="spacesOutputStats.totalChars > 0" variant="outline" class="text-xs">
                    {{ t('tools.tabs-to-spaces.chars', 'Chars') }}: {{ spacesOutputStats.totalChars }}
                  </Badge>
                </div>
              </div>
              <TextareaCopyable
                :value="spacesOutput"
                :placeholder="t('tools.tabs-to-spaces.spacesPlaceholder', 'Converted text will appear here...')"
                class="min-h-20"
                data-testid="spaces-output"
              />
            </Field>
          </FieldSet>
        </CardContent>
      </Card>

      <!-- Spaces to Tabs -->
      <Card class="h-full gap-2">
        <CardHeader>
          <div class="space-y-1">
            <CardTitle class="flex items-center gap-2">
              <ArrowLeftRight class="h-5 w-5 text-primary" />
              {{ t('tools.tabs-to-spaces.spacesToTabsTitle', 'Spaces to Tabs') }}
            </CardTitle>
            <CardDescription>
              {{ t('tools.tabs-to-spaces.spacesToTabsDescription', 'Convert spaces to tabs at tab stop boundaries.') }}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent class="space-y-5">
          <!-- Leading Only Option -->
          <div class="flex items-center justify-between rounded-lg border p-3">
            <div class="space-y-0.5">
              <p class="text-sm font-medium">
                {{ t('tools.tabs-to-spaces.leadingOnlyLabel', 'Leading spaces only') }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ t('tools.tabs-to-spaces.leadingOnlyDescription', 'Only convert spaces at the beginning of lines. When disabled, converts all spaces that align with tab stops.') }}
              </p>
            </div>
            <Switch id="leading-only" v-model="leadingOnly" />
          </div>

          <FieldSet>
            <Field orientation="vertical" class="gap-3">
              <div class="flex items-center justify-between">
                <FieldLabel class="text-sm font-medium">
                  {{ t('tools.tabs-to-spaces.inputWithSpaces', 'Input (with spaces)') }}
                </FieldLabel>
                <div class="flex items-center gap-2">
                  <Badge v-if="spacesInputStats.tabCount > 0" variant="default" class="text-xs">
                    <ArrowRightToLine class="mr-1 h-3 w-3" />
                    {{ spacesInputStats.tabCount }}
                  </Badge>
                  <Badge v-if="spacesInputStats.spaceCount > 0" variant="secondary" class="text-xs">
                    <Space class="mr-1 h-3 w-3" />
                    {{ spacesInputStats.spaceCount }}
                  </Badge>
                  <Badge v-if="spacesInputStats.totalChars > 0" variant="outline" class="text-xs">
                    {{ t('tools.tabs-to-spaces.chars', 'Chars') }}: {{ spacesInputStats.totalChars }}
                  </Badge>
                </div>
              </div>
              <Textarea
                v-model="spacesInput"
                :placeholder="t('tools.tabs-to-spaces.spacesInputPlaceholder', 'Paste text with spaces here...')"
                rows="8"
                class="max-h-96 resize-y overflow-y-auto font-mono text-sm"
                data-testid="spaces-input"
                @keydown="handleTabKeyForSpaces"
              />
              <div class="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" @click="clearSpacesInput">
                  <X class="mr-2 h-4 w-4" />
                  {{ t('common.clear', 'Clear') }}
                </Button>
                <Button size="sm" variant="outline" @click="loadSpacesExample">
                  {{ t('tools.tabs-to-spaces.loadExample', 'Load Example') }}
                </Button>
              </div>
            </Field>

            <Separator />

            <Field orientation="vertical" class="gap-3">
              <div class="flex items-center justify-between">
                <FieldLabel class="text-sm font-medium">
                  {{ t('tools.tabs-to-spaces.outputWithTabs', 'Output (with tabs)') }}
                </FieldLabel>
                <div class="flex items-center gap-2">
                  <Badge v-if="tabsOutputStats.tabCount > 0" variant="default" class="text-xs">
                    <ArrowRightToLine class="mr-1 h-3 w-3" />
                    {{ tabsOutputStats.tabCount }}
                  </Badge>
                  <Badge v-if="tabsOutputStats.spaceCount > 0" variant="secondary" class="text-xs">
                    <Space class="mr-1 h-3 w-3" />
                    {{ tabsOutputStats.spaceCount }}
                  </Badge>
                  <Badge v-if="tabsOutputStats.totalChars > 0" variant="outline" class="text-xs">
                    {{ t('tools.tabs-to-spaces.chars', 'Chars') }}: {{ tabsOutputStats.totalChars }}
                  </Badge>
                </div>
              </div>
              <TextareaCopyable
                :value="tabsOutput"
                :placeholder="t('tools.tabs-to-spaces.tabsOutputPlaceholder', 'Converted text will appear here...')"
                class="min-h-20"
                data-testid="tabs-output"
              />
            </Field>
          </FieldSet>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
