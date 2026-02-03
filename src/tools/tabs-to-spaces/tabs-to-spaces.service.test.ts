import { describe, expect, it } from 'vitest';
import { analyzeText, convertSpacesToTabs, convertTabsToSpaces } from './tabs-to-spaces.service';

describe('tabs-to-spaces', () => {
  describe('convertTabsToSpaces', () => {
    it('should convert a single tab at the beginning to correct number of spaces', () => {
      expect(convertTabsToSpaces('\t', 4)).toBe('    ');
      expect(convertTabsToSpaces('\t', 2)).toBe('  ');
      expect(convertTabsToSpaces('\t', 8)).toBe('        ');
    });

    it('should convert tab after one character correctly', () => {
      expect(convertTabsToSpaces('a\t', 4)).toBe('a   ');
      expect(convertTabsToSpaces('a\t', 2)).toBe('a ');
    });

    it('should convert tab after multiple characters correctly', () => {
      expect(convertTabsToSpaces('abc\t', 4)).toBe('abc ');
      expect(convertTabsToSpaces('ab\t', 4)).toBe('ab  ');
    });

    it('should handle multiple tabs in a row', () => {
      expect(convertTabsToSpaces('\t\t', 4)).toBe('        ');
      expect(convertTabsToSpaces('a\t\t', 4)).toBe('a       ');
    });

    it('should handle tabs in the middle of text (inline tabs)', () => {
      expect(convertTabsToSpaces('SELECT\tid,\tname', 4)).toBe('SELECT  id, name');
    });

    it('should reset column position on newline', () => {
      expect(convertTabsToSpaces('\t\n\t', 4)).toBe('    \n    ');
      expect(convertTabsToSpaces('a\t\na\t', 4)).toBe('a   \na   ');
    });

    it('should handle multi-line code with indentation', () => {
      const input = 'function example() {\n\tif (condition) {\n\t\tconsole.log("Hello");\n\t}\n}';
      const expected = 'function example() {\n    if (condition) {\n        console.log("Hello");\n    }\n}';
      expect(convertTabsToSpaces(input, 4)).toBe(expected);
    });

    it('should handle tabs used for alignment', () => {
      const input = 'const\tx\t=\t1;';
      const expected = 'const   x   =   1;';
      expect(convertTabsToSpaces(input, 4)).toBe(expected);
    });

    it('should handle CRLF line endings', () => {
      expect(convertTabsToSpaces('\t\r\n\t', 4)).toBe('    \r\n    ');
    });

    it('should throw error for invalid tab width', () => {
      expect(() => convertTabsToSpaces('\t', 0)).toThrow('Tab width must be greater than 0');
      expect(() => convertTabsToSpaces('\t', -1)).toThrow('Tab width must be greater than 0');
    });

    it('should handle empty string', () => {
      expect(convertTabsToSpaces('', 4)).toBe('');
    });

    it('should handle text without tabs', () => {
      const input = 'Hello world';
      expect(convertTabsToSpaces(input, 4)).toBe(input);
    });
  });

  describe('convertSpacesToTabs', () => {
    it('should convert spaces at tab stops to tabs', () => {
      expect(convertSpacesToTabs('    ', 4)).toBe('\t');
      expect(convertSpacesToTabs('  ', 2)).toBe('\t');
      expect(convertSpacesToTabs('        ', 8)).toBe('\t');
    });

    it('should convert multiple groups of spaces to tabs', () => {
      expect(convertSpacesToTabs('        ', 4)).toBe('\t\t');
      expect(convertSpacesToTabs('    ', 2)).toBe('\t\t');
    });

    it('should handle spaces that do not align with tab stops', () => {
      expect(convertSpacesToTabs('   ', 4)).toBe('   ');
      expect(convertSpacesToTabs('a   ', 4)).toBe('a   ');
    });

    it('should convert indented code correctly', () => {
      const input = 'function example() {\n    if (condition) {\n        console.log("Hello");\n    }\n}';
      const expected = 'function example() {\n\tif (condition) {\n\t\tconsole.log("Hello");\n\t}\n}';
      expect(convertSpacesToTabs(input, 4)).toBe(expected);
    });

    it('should handle mixed spaces and non-spaces', () => {
      const input = '    code';
      const expected = '\tcode';
      expect(convertSpacesToTabs(input, 4)).toBe(expected);
    });

    it('should throw error for invalid tab width', () => {
      expect(() => convertSpacesToTabs('    ', 0)).toThrow('Tab width must be greater than 0');
      expect(() => convertSpacesToTabs('    ', -1)).toThrow('Tab width must be greater than 0');
    });

    it('should handle empty string', () => {
      expect(convertSpacesToTabs('', 4)).toBe('');
    });

    it('should handle text without spaces', () => {
      const input = 'Hello';
      expect(convertSpacesToTabs(input, 4)).toBe(input);
    });
  });

  describe('analyzeText', () => {
    it('should count tabs and spaces correctly', () => {
      const result = analyzeText('\t  \t');
      expect(result.tabCount).toBe(2);
      expect(result.spaceCount).toBe(2);
    });

    it('should detect leading tabs', () => {
      const result = analyzeText('\tcode');
      expect(result.hasLeadingTabs).toBe(true);
      expect(result.hasInlineTabs).toBe(false);
    });

    it('should detect inline tabs', () => {
      const result = analyzeText('code\ttab');
      expect(result.hasLeadingTabs).toBe(false);
      expect(result.hasInlineTabs).toBe(true);
    });

    it('should detect both leading and inline tabs', () => {
      const result = analyzeText('\tcode\ttab');
      expect(result.hasLeadingTabs).toBe(true);
      expect(result.hasInlineTabs).toBe(true);
    });

    it('should count lines correctly', () => {
      const result = analyzeText('line1\nline2\nline3');
      expect(result.lineCount).toBe(3);
    });

    it('should count total characters', () => {
      const result = analyzeText('hello');
      expect(result.totalChars).toBe(5);
    });

    it('should handle empty string', () => {
      const result = analyzeText('');
      expect(result.totalChars).toBe(0);
      expect(result.tabCount).toBe(0);
      expect(result.spaceCount).toBe(0);
      expect(result.lineCount).toBe(1);
    });
  });

  describe('round-trip conversion', () => {
    it('should preserve text when converting tabs to spaces and back', () => {
      const original = '\tfunction() {\n\t\treturn true;\n\t}';
      const withSpaces = convertTabsToSpaces(original, 4);
      const backToTabs = convertSpacesToTabs(withSpaces, 4);
      expect(backToTabs).toBe(original);
    });
  });
});
