import type { MaybeRefOrGetter } from 'vue';
// eslint-disable-next-line no-restricted-imports
import { useClipboard } from '@vueuse/core';
import { unref } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner'

export function useCopy({
  source,
  text,
  createToast = true,
}: {
  source?: MaybeRefOrGetter<string>
  text?: MaybeRefOrGetter<string>
  createToast?: boolean
} = {}) {
  const { t } = useI18n()
  const { copy, copied, ...rest } = useClipboard({
    source,
    legacy: true,
  })

  return {
    ...rest,
    isJustCopied: copied,
    async copy(content?: string, { notificationMessage }: { notificationMessage?: string } = {}) {
      if (source) {
        await copy()
      }
      else {
        await copy(content)
      }

      if (createToast) { toast.success(notificationMessage ?? unref(text) ?? t('common.copied', 'Copied!')) }
    },
  }
}
