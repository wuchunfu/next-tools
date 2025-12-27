import type { ConvertOptions } from './list-converter.types'
import { chain, isNull, reverse, trim, uniq } from 'lodash'
import { byOrder } from '@/utils/array';

function whenever<T, R>(condition: boolean, fn: (value: T) => R) {
  return (value: T) =>
    condition ? fn(value) : value;
}

export function convert(list: string, options: ConvertOptions): string {
  const lineBreak = options.keepLineBreaks ? '\n' : '';

  return chain(list)
    .thru(whenever(options.lowerCase, text => text.toLowerCase()))
    .split('\n')
    .thru(whenever(options.removeDuplicates, uniq))
    .thru(whenever(options.reverseList, reverse))
    .thru(whenever(!isNull(options.sortList), parts => parts.sort(byOrder({ order: options.sortList }))))
    .map(whenever(options.trimItems, trim))
    .without('')
    .map(p => options.itemPrefix + p + options.itemSuffix)
    .join(options.separator + lineBreak)
    .thru(text => [options.listPrefix, text, options.listSuffix].join(lineBreak))
    .value();
}
