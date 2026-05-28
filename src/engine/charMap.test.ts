import { describe, expect, it } from 'vitest';
import { updateCharMap } from './charMap';

describe('updateCharMap', () => {
  it('records new characters from a guess', () => {
    const next = updateCharMap({}, '床前明', ['correct', 'present', 'absent']);
    expect(next).toEqual({ 床: 'correct', 前: 'present', 明: 'absent' });
  });

  it('promotes present → correct', () => {
    const prev = { 月: 'present' as const };
    const next = updateCharMap(prev, '月', ['correct']);
    expect(next.月).toBe('correct');
  });

  it('promotes absent → present', () => {
    const prev = { 月: 'absent' as const };
    const next = updateCharMap(prev, '月', ['present']);
    expect(next.月).toBe('present');
  });

  it('never downgrades present → absent', () => {
    const prev = { 月: 'present' as const };
    const next = updateCharMap(prev, '月', ['absent']);
    expect(next.月).toBe('present');
  });

  it('never downgrades correct → present', () => {
    const prev = { 月: 'correct' as const };
    const next = updateCharMap(prev, '月', ['present']);
    expect(next.月).toBe('correct');
  });

  it('handles repeated characters in the same guess', () => {
    // First 山 is correct, second is absent. Best for 山 should be correct.
    const next = updateCharMap({}, '山山', ['correct', 'absent']);
    expect(next.山).toBe('correct');
  });

  it('returns a new object (does not mutate prev)', () => {
    const prev = { 月: 'present' as const };
    const next = updateCharMap(prev, '月', ['correct']);
    expect(next).not.toBe(prev);
    expect(prev.月).toBe('present');
  });
});
