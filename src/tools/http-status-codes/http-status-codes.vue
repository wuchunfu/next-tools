<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToolI18n } from '@/composable/useToolI18n';
import { codesByCategories } from './http-status-codes.constants'

const { t } = useToolI18n()
const search = ref('')

const normalizeKey = (value: string) => value.replace(/[^a-z0-9]/gi, '-').toLowerCase()

const codesByCategoryFiltered = computed(() => {
  if (!search.value) {
    return codesByCategories.map(({ category, codes }) => ({
      category: t(`tools.http-status-codes.categories.${normalizeKey(category)}`, category),
      codes: codes.map(item => ({
        ...item,
        name: t(`tools.http-status-codes.codes.${item.code}.name`, item.name),
        description: t(
          `tools.http-status-codes.codes.${item.code}.description`,
          item.description,
        ),
        type: t(`tools.http-status-codes.types.${item.type.toLowerCase()}`, item.type),
      })),
    }))
  }

  const term = search.value.trim()
  const isNumericSearch = /^\d+$/.test(term)

  // 扁平化原始数据，做简单过滤
  const flattened = codesByCategories.flatMap(({ codes, category }) =>
    codes.map(code => ({ ...code, category })),
  )

  const filteredSearchResults = flattened.filter((item) => {
    const codeStr = String(item.code)
    const name = item.name ?? ''
    const description = item.description ?? ''
    const category = item.category ?? ''

    if (isNumericSearch) {
      // 纯数字：只按状态码前缀匹配
      return codeStr.startsWith(term)
    }

    const lowerTerm = term.toLowerCase()
    return (
      codeStr.includes(lowerTerm)
      || name.toLowerCase().includes(lowerTerm)
      || description.toLowerCase().includes(lowerTerm)
      || category.toLowerCase().includes(lowerTerm)
    )
  });

  return [
    {
      category: t('tools.http-status-codes.searchResults'),
      codes: filteredSearchResults.map(item => ({
        ...item,
        name: t(`tools.http-status-codes.codes.${item.code}.name`, item.name),
        description: t(
          `tools.http-status-codes.codes.${item.code}.description`,
          item.description,
        ),
        type: t(`tools.http-status-codes.types.${item.type.toLowerCase()}`, item.type),
      })),
    },
  ]
});
</script>

<template>
  <Card>
    <CardContent class="space-y-8">
      <FieldGroup>
        <Field>
          <FieldLabel class="sr-only">
            {{ t('tools.http-status-codes.searchPlaceholder') }}
          </FieldLabel>
          <FieldContent>
            <Input
              v-model="search"
              :placeholder="t('tools.http-status-codes.searchPlaceholder')"
              autofocus
            />
          </FieldContent>
        </Field>
      </FieldGroup>

      <div v-for="{ codes, category } of codesByCategoryFiltered" :key="category" class="space-y-3">
        <div class="text-xl font-semibold text-foreground">
          {{ category }}
        </div>

        <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Card v-for="{ code, description, name, type } of codes" :key="code" class="border shadow-sm p-0">
            <CardContent class="space-y-2 p-4">
              <div class="text-lg font-semibold">
                {{ code }} {{ name }}
              </div>
              <div class="text-sm text-muted-foreground leading-relaxed">
                {{ description }} {{ type !== 'HTTP' ? t('tools.http-status-codes.forType', { type }) : '' }}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
