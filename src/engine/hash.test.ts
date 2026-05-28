import { describe, expect, it } from 'vitest';
import { fnv1a32 } from './hash';

describe('fnv1a32', () => {
  it('returns 0x811c9dc5 for the empty string (FNV offset basis)', () => {
    expect(fnv1a32('')).toBe(0x811c9dc5);
  });

  it('is deterministic — same input ⇒ same output', () => {
    expect(fnv1a32('20260528')).toBe(fnv1a32('20260528'));
  });

  it('different inputs ⇒ different outputs (for these fixtures)', () => {
    expect(fnv1a32('20260528')).not.toBe(fnv1a32('20260529'));
  });

  it('returns an unsigned 32-bit integer', () => {
    const h = fnv1a32('hello');
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThan(2 ** 32);
  });
});
