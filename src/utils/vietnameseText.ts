/**
 * Utility to repair and sanitize Vietnamese text formatting glitches.
 * Fixes issues where Vietnamese IMEs (Unikey/Telex/IBus/etc.) or non-standard
 * encodings detach tone accents (´, `, etc.) or split syllables with spaces,
 * e.g. "Nhấ t" -> "Nhất", "muố n" -> "muốn", "đong đâ y" -> "đong đầy".
 */

export function cleanVietnameseText(str: string): string {
  if (!str || typeof str !== 'string') return str;
  let s = str.normalize('NFC');

  // Fix common words where tone marks or trailing consonants were separated by IME glitches
  const wordFixes: [RegExp, (m: string) => string][] = [
    [/Nhấ[\s´`\u0300-\u036f]*t\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Nhất' : 'nhất')],
    [/muố[\s´`\u0300-\u036f]*n\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Muốn' : 'muốn')],
    [/đế[\s´`\u0300-\u036f]*n\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Đến' : 'đến')],
    [/xuấ[\s´`\u0300-\u036f]*t\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Xuất' : 'xuất')],
    [/niề[\s´`\u0300-\u036f]*m\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Niềm' : 'niềm')],
    [/khắ[\s´`\u0300-\u036f]*c\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Khắc' : 'khắc')],
    [/ấ[\s´`\u0300-\u036f]*m\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Ấm' : 'ấm')],
    [/đề[\s´`\u0300-\u036f]*u\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Đều' : 'đều')],
    [/nắ[\s´`\u0300-\u036f]*ng\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Nắng' : 'nắng')],
    [/chiê[\s´`\u0300-\u036f]*u\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Chiều' : 'chiều')],
    [/suố[\s´`\u0300-\u036f]*t\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Suốt' : 'suốt')],
    [/đồ[\s´`\u0300-\u036f]*ng\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Đồng' : 'đồng')],
    [/lắ[\s´`\u0300-\u036f]*ng\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Lắng' : 'lắng')],
    [/bằ[\s´`\u0300-\u036f]*ng\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Bằng' : 'bằng')],
    [/tấ[\s´`\u0300-\u036f]*t\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Tất' : 'tất')],
    [/nhiề[\s´`\u0300-\u036f]*u\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Nhiều' : 'nhiều')],
    [/biế[\s´`\u0300-\u036f]*t\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Biết' : 'biết')],
    [/tuyệ[\s´`\u0300-\u036f]*t\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Tuyệt' : 'tuyệt')],
    [/trướ[\s´`\u0300-\u036f]*c\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Trước' : 'trước')],
    [/thươ[\s´`\u0300-\u036f]*ng\b/gi, (m) => (m[0] === m[0].toUpperCase() ? 'Thương' : 'thương')],
  ];

  for (const [pattern, replacement] of wordFixes) {
    s = s.replace(pattern, replacement);
  }

  // Handle đâ with grave/acute/space
  // đâ with grave -> đầy
  s = s.replace(/đâ[\s´`\u0300-\u036f]*[`\u0300\u02CB][\s´`\u0300-\u036f]*y\b/gi, (m) =>
    m[0] === 'Đ' ? 'Đầy' : 'đầy'
  );
  // đâ with acute -> đấy
  s = s.replace(/đâ[\s´`\u0300-\u036f]*[´\u0301\u02CA][\s´`\u0300-\u036f]*y\b/gi, (m) =>
    m[0] === 'Đ' ? 'Đấy' : 'đấy'
  );
  // đâ with space -> đây
  s = s.replace(/đâ\s+y\b/gi, (m) => (m[0] === 'Đ' ? 'Đây' : 'đây'));

  // If there are stray standalone acute/grave marks between letters within a word:
  s = s.replace(
    /([a-zà-ỹá-ýâ-ấă-ắê-ếô-ốơ-ớư-ứđ])\s*[´`\u0300-\u036f\u02CA\u02CB]+\s*([a-zà-ỹá-ýâ-ấă-ắê-ếô-ốơ-ớư-ứđ]+)/gi,
    '$1$2'
  );

  // Clean any remaining standalone stray accents
  s = s.replace(/[´`\u00B4\u02CA\u0301\u0060\u02CB\u0300\u02C6\u0302\u02DC\u0303\u02C7\u0306\u02C9\u0304]/g, '');

  return s.normalize('NFC');
}
