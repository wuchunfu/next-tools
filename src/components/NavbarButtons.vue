<script setup lang="ts">
import { Github, Info, Moon, Sun } from 'lucide-vue-next';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { isDarkTheme } = toRefs(styleStore);
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          as="a"
          variant="ghost"
          size="icon"
          href="https://github.com/willjayyyy/next-tools"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="$t('home.nav.githubRepository')"
        >
          <Github class="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{{ $t('home.nav.github') }}</TooltipContent>
    </Tooltip>

    <!-- <Tooltip>
      <TooltipTrigger as-child>
        <Button
          as="a"
          variant="ghost"
          size="icon"
          href="https://x.com/willjayyy"
          rel="noopener"
          target="_blank"
          :aria-label="$t('home.nav.twitterXAccount')"
        >
          <Twitter class="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{{ $t('home.nav.twitterX') }}</TooltipContent>
    </Tooltip> -->

    <Tooltip>
      <TooltipTrigger>
        <router-link to="/about" class="inline-flex">
          <Button variant="ghost" size="icon" :aria-label="$t('home.nav.aboutLabel')">
            <Info class="h-5 w-5" />
          </Button>
        </router-link>
      </TooltipTrigger>
      <TooltipContent>{{ $t('home.nav.about') }}</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon" :aria-label="$t('home.nav.mode')" @click="() => styleStore.toggleDark()">
          <Sun v-if="isDarkTheme" class="h-5 w-5" />
          <Moon v-else class="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {{ isDarkTheme ? $t('home.nav.lightMode') : $t('home.nav.darkMode') }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
