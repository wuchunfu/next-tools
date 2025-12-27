function convertTextToUnicode(text: string): string {
  return text.split('').map((value) => {
    const code = value.charCodeAt(0)
    return `\\u${code.toString(16).toUpperCase().padStart(4, '0')}`
  }).join('')
}

function convertUnicodeToText(unicodeStr: string): string {
  return unicodeStr.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
    return String.fromCharCode(Number.parseInt(hex, 16))
  });
}

export { convertTextToUnicode, convertUnicodeToText }
