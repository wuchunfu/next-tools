<script setup lang="ts">
import type { Group, Scope } from './chmod-calculator.types'
import { Shield } from 'lucide-vue-next'
import InputCopyable from '@/components/InputCopyable.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToolI18n } from '@/composable/useToolI18n'
import { tableCellClasses, tableContainerClasses, tableHeadClasses, tableHeaderClasses } from '@/utils/table'
import { computeChmodOctalRepresentation, computeChmodSymbolicRepresentation } from './chmod-calculator.service'

const { t } = useToolI18n();

const scopes = computed<{ scope: Scope, title: string }[]>(() => [
  { scope: 'read', title: t('tools.chmod-calculator.read') },
  { scope: 'write', title: t('tools.chmod-calculator.write') },
  { scope: 'execute', title: t('tools.chmod-calculator.execute') },
]);
const groups: Group[] = ['owner', 'group', 'public'];

const permissions = reactive({
  owner: { read: false, write: false, execute: false },
  group: { read: false, write: false, execute: false },
  public: { read: false, write: false, execute: false },
});

const octal = computed(() => computeChmodOctalRepresentation({ permissions }));
const symbolic = computed(() => computeChmodSymbolicRepresentation({ permissions }));
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card>
      <CardHeader>
        <div class="space-y-1">
          <CardTitle class="flex items-center gap-2">
            <Shield class="h-5 w-5 text-primary" />
            {{ t('tools.chmod-calculator.permissionsTitle', 'File Permissions') }}
          </CardTitle>
          <CardDescription>
            {{ t('tools.chmod-calculator.permissionsDescription', 'Select permissions for owner, group, and public. The octal and symbolic representations will be calculated automatically.') }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Table :container-class="tableContainerClasses">
          <TableHeader :class="tableHeaderClasses">
            <TableRow>
              <TableHead :class="tableHeadClasses" />
              <TableHead :class="tableHeadClasses">
                {{ t('tools.chmod-calculator.owner') }}
              </TableHead>
              <TableHead :class="tableHeadClasses">
                {{ t('tools.chmod-calculator.group') }}
              </TableHead>
              <TableHead :class="tableHeadClasses">
                {{ t('tools.chmod-calculator.public') }}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="{ scope, title } of scopes" :key="scope">
              <TableCell :class="tableCellClasses">
                {{ title }}
              </TableCell>
              <TableCell v-for="group of groups" :key="group" :class="tableCellClasses">
                <Checkbox
                  v-model="permissions[group][scope]"
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <div class="space-y-1">
          <CardTitle>{{ t('tools.chmod-calculator.resultsTitle', 'Results') }}</CardTitle>
          <CardDescription>
            {{ t('tools.chmod-calculator.resultsDescription', 'Octal and symbolic representations of the selected permissions.') }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent class="space-y-6">
        <FieldGroup>
          <Field>
            <FieldLabel>{{ t('tools.chmod-calculator.octalLabel', 'Octal representation') }}</FieldLabel>
            <FieldContent>
              <div class="flex items-center justify-center">
                <div class="rounded-xl border bg-card px-6 py-3 text-5xl font-semibold tabular-nums text-primary">
                  {{ octal }}
                </div>
              </div>
            </FieldContent>
          </Field>

          <Separator />

          <Field>
            <FieldLabel>{{ t('tools.chmod-calculator.symbolicLabel', 'Symbolic representation') }}</FieldLabel>
            <FieldContent>
              <div class="flex items-center justify-center">
                <div class="rounded-xl border bg-card px-6 py-3 text-3xl font-semibold tabular-nums text-primary">
                  {{ symbolic }}
                </div>
              </div>
            </FieldContent>
          </Field>

          <Separator />

          <Field>
            <FieldLabel>{{ t('tools.chmod-calculator.commandLabel', 'Command') }}</FieldLabel>
            <FieldContent>
              <InputCopyable :value="t('tools.chmod-calculator.copyCommand', { octal })" readonly />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
</template>
