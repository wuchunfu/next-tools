<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { FileQuestion } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

useHead({ title: 'Page not found - Next Tools' });
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
    <Empty class="max-w-md mx-auto">
      <EmptyMedia variant="icon">
        <FileQuestion />
      </EmptyMedia>

      <EmptyTitle>
        {{ $t('404.notFound') }}
      </EmptyTitle>

      <EmptyDescription>
        <p>{{ $t('404.sorry') }}</p>
        <p>{{ $t('404.maybe') }}</p>
      </EmptyDescription>

      <EmptyContent>
        <Button as-child>
          <router-link to="/">
            {{ $t('404.backHome') }}
          </router-link>
        </Button>
      </EmptyContent>
    </Empty>
  </div>
</template>
