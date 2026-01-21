import type { MaybeRef } from 'vue';
import JSONBig from 'json-bigint';

// Create a json-bigint instance that uses native BigInt
const JSONBigInt = JSONBig({ useNativeBigInt: true });

export function sortObjectKeys<T>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys) as unknown as T
  }

  return Object.keys(obj)
    .sort((a, b) => a.localeCompare(b))
    .reduce((sortedObj, key) => {
      sortedObj[key] = sortObjectKeys((obj as Record<string, unknown>)[key])
      return sortedObj
    }, {} as Record<string, unknown>) as T
}

export function formatJson({
  rawJson,
  sortKeys = true,
  indentSize = 3,
}: {
  rawJson: MaybeRef<string>
  sortKeys?: MaybeRef<boolean>
  indentSize?: MaybeRef<number>
}) {
  const parsedObject = JSONBigInt.parse(toValue(rawJson));
  
  return JSONBigInt.stringify(toValue(sortKeys) ? sortObjectKeys(parsedObject) : parsedObject, null, toValue(indentSize))
}
