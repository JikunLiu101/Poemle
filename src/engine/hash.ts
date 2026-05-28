/**
 * FNV-1a 32-bit hash. Operates on UTF-8 byte view of the input string so it
 * is well-defined for multi-byte Chinese characters too — we coerce to bytes
 * via TextEncoder.
 */
const OFFSET = 0x811c9dc5;
const PRIME = 0x01000193;

const enc = new TextEncoder();

export function fnv1a32(input: string): number {
  const bytes = enc.encode(input);
  let h = OFFSET;
  for (let i = 0; i < bytes.length; i++) {
    h ^= bytes[i];
    // Math.imul keeps the multiplication within 32-bit signed range.
    h = Math.imul(h, PRIME);
  }
  // Coerce to unsigned 32-bit.
  return h >>> 0;
}
