import { get } from '@vueuse/core';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { loadToolMessages } from '@/plugins/i18n.plugin'

/**
 * 工具 i18n 组合式函数
 * 在工具组件中使用，自动加载对应工具的翻译
 */
export function useToolI18n() {
  const route = useRoute();
  const i18n = useI18n();
  const { locale } = i18n;

  // 当路由或语言改变时，加载工具翻译
  watch(
    [() => route.path, () => get(locale)],
    async ([path, currentLocale]) => {
      // 检查是否是工具路由
      if (route.meta?.isTool && path) {
        await loadToolMessages(path, currentLocale);
      }
    },
    { immediate: true },
  );

  return i18n as ReturnType<typeof useI18n>;
}
