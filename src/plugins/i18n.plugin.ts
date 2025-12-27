import type { Plugin } from 'vue'
import messages from '@intlify/unplugin-vue-i18n/messages'
import { get } from '@vueuse/core'
import { createI18n, type I18n } from 'vue-i18n';

const i18n: I18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  missing: () => '',
  fallbackWarn: false,
  messages,
});

// 缓存已加载的工具翻译
const loadedToolMessages = new Set<string>();

/**
 * 动态加载工具翻译
 * @param toolPath 工具路径，例如 '/chronometer'
 * @param locale 语言代码，例如 'en', 'zh'
 */
export async function loadToolMessages(toolPath: string, locale: string = 'en') {
  const toolName = toolPath.replace(/^\//, ''); // 移除前导斜杠
  const cacheKey = `${toolName}-${locale}`;

  // 如果已经加载过，直接返回
  if (loadedToolMessages.has(cacheKey)) {
    return;
  }

  // 路径到目录名的映射（处理路径和目录名不一致的情况）
  const pathToDirMap: Record<string, string> = {
    'qrcode-generator': 'qr-code-generator',
    'json-prettify': 'json-viewer',
    'json-viewer': 'json-viewer', // json-viewer 重定向到 json-prettify
    'base-converter': 'integer-base-converter',
    'date-converter': 'date-time-converter',
    'wifi-qrcode-generator': 'wifi-qr-code-generator',
    'og-meta-generator': 'meta-tag-generator',
    'otp-generator': 'otp-code-generator-and-validator',
    'yaml-prettify': 'yaml-viewer',
  }

  const toolDir = pathToDirMap[toolName] || toolName;

  try {
    // 使用 ?raw 方式动态导入 YAML 文件，然后手动解析
    // 这样可以避免 vite 的 i18n 插件自动加载导致循环引用
    // 路径格式: src/tools/{toolDir}/locales/${locale}.yml?raw
    const content = await import(`@/tools/${toolDir}/locales/${locale}.json`).catch((e) => {
      console.error(e);
      return null;
    })

    if (content?.default) {
      // 手动解析 YAML 内容
      const toolMessages = content.default;

      // 使用 vue-i18n 的 mergeLocaleMessage 方法合并翻译
      i18n.global.mergeLocaleMessage(locale, toolMessages as any);
      loadedToolMessages.add(cacheKey);
    }
  }
  catch (error) {
    // 翻译文件不存在时静默失败
    console.warn(`Translation file not found for tool: ${toolName}, locale: ${locale}`, error);
  }
}

export const i18nPlugin: Plugin = {
  install: (app) => {
    app.use(i18n);
  },
};

export const translate = function (localeKey: string) {
  const hasKey = i18n.global.te(localeKey, get(i18n.global.locale));
  return hasKey ? (i18n.global.t as any)(localeKey) : localeKey;
}

export { i18n };
