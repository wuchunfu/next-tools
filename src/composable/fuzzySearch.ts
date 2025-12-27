import type { IFuseOptions } from 'fuse.js';
import Fuse from 'fuse.js';
import { isFunction } from 'lodash';
import { computed, type MaybeRefOrGetter, unref } from 'vue'

function useFuzzySearch<Data>({
  search,
  data,
  options = {},
}: {
  search: MaybeRefOrGetter<string>
  data: MaybeRefOrGetter<Data[]>
  options?: MaybeRefOrGetter<IFuseOptions<Data> & { filterEmpty?: boolean }>
}) {
  const resolvedOptions = computed(() => {
    const opts = isFunction(options) ? options() : unref(options)
    return { ...opts }
  });

  const filterEmpty = computed(() => resolvedOptions.value.filterEmpty ?? true)

  const searchResult = computed<Data[]>(() => {
    const query = isFunction(search) ? search() : unref(search)
    const dataArray = isFunction(data) ? data() : unref(data)
    const fuse = new Fuse(dataArray, resolvedOptions.value)

    if (!filterEmpty.value && query === '') {
      return dataArray
    }

    return fuse.search(query).map(({ item }) => item)
  });

  return { searchResult }
}

export { useFuzzySearch }
