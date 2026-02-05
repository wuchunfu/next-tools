interface RegExpGroupIndices {
  [name: string]: [number, number] | undefined
}
interface RegExpIndices extends Array<[number, number] | undefined> {
  groups?: RegExpGroupIndices
}
interface RegExpExecArrayWithIndices extends RegExpExecArray {
  indices?: RegExpIndices
}
interface GroupCapture {
  name: string
  value: string
  start: number
  end: number
}

export function matchRegex(regex: string, text: string, flags: string) {
  if (regex === '') {
    return []
  }

  const re = new RegExp(regex, flags)
  const isGlobal = re.global
  const results = []
  let match = re.exec(text) as RegExpExecArrayWithIndices | null
  let iterationCount = 0
  const maxIterations = 10000 // Prevent infinite loops

  while (match !== null && iterationCount < maxIterations) {
    iterationCount++

    const indices = match.indices
    const captures: Array<GroupCapture> = []

    // Process numbered capture groups
    Object.entries(match).forEach(([captureName, captureValue]) => {
      // Skip capture groups that didn't participate in the match (undefined value)
      // This happens with alternation patterns where only one branch matches
      if (captureName !== '0' && /^\d+$/.test(captureName) && captureValue !== undefined) {
        const captureIndices = indices?.[Number(captureName)]
        if (captureIndices) {
          captures.push({
            name: captureName,
            value: captureValue,
            start: captureIndices[0],
            end: captureIndices[1],
          })
        }
      }
    })

    // Process named capture groups
    const groups: Array<GroupCapture> = []
    if (match.groups) {
      Object.entries(match.groups).forEach(([groupName, groupValue]) => {
        // Skip named groups that didn't participate in the match
        if (groupValue !== undefined) {
          const groupIndices = indices?.groups?.[groupName]
          if (groupIndices) {
            groups.push({
              name: groupName,
              value: groupValue,
              start: groupIndices[0],
              end: groupIndices[1],
            })
          }
        }
      })
    }

    results.push({
      index: match.index,
      value: match[0],
      captures,
      groups,
    })

    // For non-global regex, only return the first match
    if (!isGlobal) {
      break
    }

    // Handle zero-length matches to prevent infinite loop
    // When a zero-length match occurs, manually advance lastIndex
    if (match[0].length === 0) {
      re.lastIndex++
    }

    match = re.exec(text) as RegExpExecArrayWithIndices | null
  }

  return results
}
