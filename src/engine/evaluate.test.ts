import { describe, expect, it } from 'vitest';
import { evaluateGuess } from './evaluate';

describe('evaluateGuess', () => {
  it('marks every position correct when guess equals answer', () => {
    expect(evaluateGuess('床前明月光', '床前明月光'))
      .toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
  });

  it('marks character present when it exists at a different position', () => {
    expect(evaluateGuess('月光明前床', '床前明月光'))
      .toEqual(['present', 'present', 'correct', 'present', 'present']);
  });

  it('marks character absent when it does not exist in the answer', () => {
    expect(evaluateGuess('A床B前C', '床前明月光'))
      .toEqual(['absent', 'present', 'absent', 'present', 'absent']);
  });

  it('duplicate: answer has one X, guess has two — exact wins, other is absent', () => {
    expect(evaluateGuess('山山', '山下')).toEqual(['correct', 'absent']);
  });

  it('duplicate: answer has one X, guess has two and neither is the exact position', () => {
    // Answer "下山" — 山 at position 1.
    // Pass 1 marks pos 1 correct (consumes 山 from pool). Pos 0 in pass 2 finds empty 山-pool ⇒ absent.
    expect(evaluateGuess('山山', '下山')).toEqual(['absent', 'correct']);
  });

  it('duplicate: answer has zero X, guess has two — both absent', () => {
    expect(evaluateGuess('AA', '床前')).toEqual(['absent', 'absent']);
  });

  it('duplicate: answer has two X, guess has two — both can be present/correct', () => {
    expect(evaluateGuess('AABB', 'BBAA')).toEqual(['present', 'present', 'present', 'present']);
  });

  it('throws if guess and answer differ in length', () => {
    expect(() => evaluateGuess('床', '床前')).toThrow();
  });
});
