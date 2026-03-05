/**
 * Sanitize qr_code_image that sometimes comes as Python bytes repr: b'...' or b"..."
 */

export function sanitizeQrImageBase64(value: string | undefined): string {
  if (!value || typeof value !== 'string') return '';

  let s = value.trim();

  // b'...' variant
  if (s.startsWith("b'") && s.endsWith("'")) {
    s = s.slice(2, -1);
  }
  // b"..." variant
  else if (s.startsWith('b"') && s.endsWith('"')) {
    s = s.slice(2, -1);
  }

  return s;
}
