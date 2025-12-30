<script setup lang="ts">
import { Analytics } from '@vercel/analytics/vue';
import { config } from '@/config';
</script>

<template>
  <Analytics :debug="config.vercelAnalytics.debug" />
</template>


