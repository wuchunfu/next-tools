/**
 * Convert tabs to spaces based on tab stop semantics
 * 
 * This function correctly handles tab characters by treating them as "jump to next tab stop"
 * rather than "replace with N spaces". It maintains column position tracking to ensure
 * visual alignment is preserved in monospace fonts.
 * 
 * @param text - The input text containing tab characters
 * @param tabWidth - The tab stop interval (default: 4)
 * @returns The text with tabs converted to appropriate number of spaces
 */
export function convertTabsToSpaces(text: string, tabWidth: number = 4): string {
  if (tabWidth <= 0) {
    throw new Error('Tab width must be greater than 0');
  }

  let result = '';
  let column = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '\t') {
      // Calculate spaces needed to reach next tab stop
      const spacesToAdd = tabWidth - (column % tabWidth);
      result += ' '.repeat(spacesToAdd);
      column += spacesToAdd;
    } else if (char === '\n') {
      // Newline resets column position
      result += char;
      column = 0;
    } else if (char === '\r') {
      // Carriage return (handle CRLF)
      result += char;
      // Don't reset column yet - wait for potential \n
      if (i + 1 < text.length && text[i + 1] !== '\n') {
        column = 0;
      }
    } else {
      // Regular character
      result += char;
      column += 1;
    }
  }

  return result;
}

/**
 * Convert spaces to tabs based on tab stop semantics
 * 
 * This function converts sequences of spaces that align with tab stops back to tabs.
 * 
 * @param text - The input text containing spaces
 * @param tabWidth - The tab stop interval (default: 4)
 * @param leadingOnly - If true, only convert spaces at the beginning of lines (default: true)
 * @returns The text with appropriate spaces converted to tabs
 */
export function convertSpacesToTabs(text: string, tabWidth: number = 4, leadingOnly: boolean = true): string {
  if (tabWidth <= 0) {
    throw new Error('Tab width must be greater than 0');
  }

  const lines = text.split('\n');
  const result: string[] = [];

  for (const line of lines) {
    let convertedLine = '';
    let spaceCount = 0;
    let isLeadingWhitespace = true;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '\t') {
        // Tab character - add any pending spaces first, then add the tab
        if (spaceCount > 0) {
          convertedLine += ' '.repeat(spaceCount);
          spaceCount = 0;
        }
        convertedLine += '\t';
        // Tabs don't break leading whitespace status
      } else if (char === ' ') {
        // Only process spaces if: not leadingOnly mode, OR we're still in leading whitespace
        if (!leadingOnly || isLeadingWhitespace) {
          spaceCount++;

          // Check if we've accumulated exactly tabWidth spaces
          if (spaceCount === tabWidth) {
            // Convert accumulated spaces to a tab
            convertedLine += '\t';
            spaceCount = 0;
          }
        } else {
          // In leadingOnly mode and not leading whitespace anymore
          // Just add the space as-is
          convertedLine += char;
        }
      } else {
        // Non-whitespace character encountered
        isLeadingWhitespace = false;
        
        // Add any remaining spaces that didn't get converted
        if (spaceCount > 0) {
          convertedLine += ' '.repeat(spaceCount);
          spaceCount = 0;
        }
        convertedLine += char;
      }
    }

    // Add any trailing spaces
    if (spaceCount > 0) {
      convertedLine += ' '.repeat(spaceCount);
    }

    result.push(convertedLine);
  }

  return result.join('\n');
}

/**
 * Analyze text to provide statistics about tabs and spaces
 */
export function analyzeText(text: string): {
  totalChars: number;
  tabCount: number;
  spaceCount: number;
  lineCount: number;
  hasLeadingTabs: boolean;
  hasInlineTabs: boolean;
} {
  const lines = text.split('\n');
  let tabCount = 0;
  let spaceCount = 0;
  let hasLeadingTabs = false;
  let hasInlineTabs = false;

  for (const line of lines) {
    let leadingWhitespace = true;
    
    for (const char of line) {
      if (char === '\t') {
        tabCount++;
        if (leadingWhitespace) {
          hasLeadingTabs = true;
        } else {
          hasInlineTabs = true;
        }
      } else if (char === ' ') {
        spaceCount++;
      } else {
        leadingWhitespace = false;
      }
    }
  }

  return {
    totalChars: text.length,
    tabCount,
    spaceCount,
    lineCount: lines.length,
    hasLeadingTabs,
    hasInlineTabs,
  };
}
