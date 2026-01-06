import type { ConvertOptions } from './list-converter.types'
import { isNull, reverse, trim, uniq, without } from 'lodash-es'
import { byOrder } from '@/utils/array';

function whenever<T, R>(condition: boolean, fn: (value: T) => R) {
  return (value: T) =>
    condition ? fn(value) : value;
}

export function convert(list: string, options: ConvertOptions): string {
  const lineBreak = options.keepLineBreaks ? '\n' : '';

  let text = list;

  // Apply lowercase if needed
  if (options.lowerCase) {
    text = text.toLowerCase();
  }

  // Split into lines
  let parts = text.split('\n');

  // Remove duplicates if needed
  if (options.removeDuplicates) {
    parts = uniq(parts);
  }

  // Reverse if needed
  if (options.reverseList) {
    parts = reverse(parts);
  }

  // Sort if needed
  if (!isNull(options.sortList)) {
    parts = parts.sort(byOrder({ order: options.sortList }));
  }

  // Trim items if needed
  if (options.trimItems) {
    parts = parts.map(trim);
  }

  // Remove empty strings
  parts = without(parts, '');

  // Add prefix and suffix
  parts = parts.map(p => options.itemPrefix + p + options.itemSuffix);

  // Join and add list prefix/suffix
  const joined = parts.join(options.separator + lineBreak);
  return [options.listPrefix, joined, options.listSuffix].join(lineBreak);
}
