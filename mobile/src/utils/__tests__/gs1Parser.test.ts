import { parseGS1 } from '@utils/gs1Parser';

const GS = '\x1D'; // GS1 group separator (ASCII 29)

describe('parseGS1 — AI 240 (material number)', () => {
  it('extracts material number from AI 240 segment', () => {
    // Typical Merck DATA_MATRIX: GS1 separator + GTIN + separator + material#
    const raw = `${GS}0112345678901234${GS}2401234567`;
    expect(parseGS1(raw)).toBe('1234567');
  });

  it('extracts AI 240 even when it is the only segment', () => {
    const raw = '2401234567';
    expect(parseGS1(raw)).toBe('1234567');
  });

  it('AI 240 wins over AI 123 when both present', () => {
    const raw = `${GS}12345678${GS}240MAT001${GS}123ART99`;
    expect(parseGS1(raw)).toBe('MAT001');
  });

  it('AI 240 wins over AI 01 when both present', () => {
    const raw = `${GS}0100012345678905${GS}240MATNUM`;
    expect(parseGS1(raw)).toBe('MATNUM');
  });

  it('strips the 3-char "240" prefix from material number', () => {
    const raw = `240ABC123`;
    expect(parseGS1(raw)).toBe('ABC123');
  });
});

describe('parseGS1 — AI 123 (article number fallback)', () => {
  it('extracts article number from AI 123 when no AI 240 present', () => {
    const raw = `${GS}0112345678901234${GS}123ARTNO`;
    expect(parseGS1(raw)).toBe('ARTNO');
  });

  it('strips the 3-char "123" prefix from article number', () => {
    const raw = '123ART456';
    expect(parseGS1(raw)).toBe('ART456');
  });
});

describe('parseGS1 — AI 01 (GTIN fallback)', () => {
  it('extracts and strips leading zeros from GTIN-14 (no-parentheses format)', () => {
    const raw = '010001234567890';
    // 01 + 14 digits: 00012345678905 → strip leading zeros → 12345678905
    expect(parseGS1('0100012345678905')).toBe('12345678905');
  });

  it('extracts GTIN from parentheses format (01)XXXXXXXXXXXXXX', () => {
    expect(parseGS1('(01)00012345678905')).toBe('12345678905');
  });

  it('does not strip all zeros if GTIN is all zeros', () => {
    // edge case: result should not be empty string
    const result = parseGS1('0100000000000000');
    expect(result).toBeTruthy();
  });
});

describe('parseGS1 — GS1 separator splitting', () => {
  it('correctly processes multi-segment strings with GS separator', () => {
    // Real-world: leading GS + GTIN segment + expiry + batch + material
    const raw = `${GS}0112345678901234${GS}17260630${GS}10BATCH01${GS}240MAT9999`;
    expect(parseGS1(raw)).toBe('MAT9999');
  });

  it('handles string starting without a leading GS separator', () => {
    const raw = `0112345678901234${GS}240MATX`;
    expect(parseGS1(raw)).toBe('MATX');
  });

  it('handles single segment with no GS separators', () => {
    // Falls back to alphanumeric raw value
    expect(parseGS1('ABCD1234')).toBe('ABCD1234');
  });
});

describe('parseGS1 — edge cases', () => {
  it('returns null for empty string', () => {
    expect(parseGS1('')).toBeNull();
  });

  it('returns null for non-GS1 non-alphanumeric string', () => {
    // Contains spaces and special chars that don't match any pattern
    expect(parseGS1('   !!!   ')).toBeNull();
  });

  it('is not affected by data from a previous call (no shared state)', () => {
    parseGS1('123FIRSTSCAN');
    // Second call with no AI 123 / 240 should not return first scan's value
    const result = parseGS1('(01)00012345678905');
    expect(result).not.toBe('FIRSTSCAN');
  });
});
