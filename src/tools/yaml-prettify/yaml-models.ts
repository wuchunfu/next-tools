import type { MaybeRef } from 'vue';
import { get } from '@vueuse/core';

import yaml from 'yaml'

export function formatYaml({
  rawYaml,
  sortKeys = false,
  indentSize = 2,
}: {
  rawYaml: MaybeRef<string>
  sortKeys?: MaybeRef<boolean>
  indentSize?: MaybeRef<number>
}) {
  // Parse YAML with BigInt support for large integers
  const parsedYaml = yaml.parse(get(rawYaml), { intAsBigInt: true })

  const formattedYAML = yaml.stringify(parsedYaml, {
    sortMapEntries: get(sortKeys),
    indent: get(indentSize),
  })

  return formattedYAML
}
