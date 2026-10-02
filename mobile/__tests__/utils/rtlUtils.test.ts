/**
 * RTL Utility Tests
 */

import {
  isRTLLanguage,
  getTextAlign,
  getFlexDirection,
  getStartEnd,
} from '@utils/rtlUtils';

describe('isRTLLanguage', () => {
  it('returns true for Arabic (ar)', () => {
    expect(isRTLLanguage('ar')).toBe(true);
  });

  it('returns true for Hebrew (he)', () => {
    expect(isRTLLanguage('he')).toBe(true);
  });

  it('returns true for Persian (fa)', () => {
    expect(isRTLLanguage('fa')).toBe(true);
  });

  it('returns true for Urdu (ur)', () => {
    expect(isRTLLanguage('ur')).toBe(true);
  });

  it('returns true for Yiddish (yi)', () => {
    expect(isRTLLanguage('yi')).toBe(true);
  });

  it('returns true for locale tags like ar-SA', () => {
    expect(isRTLLanguage('ar-SA')).toBe(true);
  });

  it('returns true for uppercase RTL code', () => {
    expect(isRTLLanguage('AR')).toBe(true);
  });

  it('returns false for English', () => {
    expect(isRTLLanguage('en')).toBe(false);
  });

  it('returns false for French', () => {
    expect(isRTLLanguage('fr')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isRTLLanguage('')).toBe(false);
  });
});

describe('getTextAlign', () => {
  it('returns right when RTL', () => {
    expect(getTextAlign(true)).toBe('right');
  });

  it('returns left when LTR', () => {
    expect(getTextAlign(false)).toBe('left');
  });
});

describe('getFlexDirection', () => {
  it('returns row-reverse when RTL', () => {
    expect(getFlexDirection(true)).toBe('row-reverse');
  });

  it('returns row when LTR', () => {
    expect(getFlexDirection(false)).toBe('row');
  });
});

describe('getStartEnd', () => {
  it('returns RTL-correct margin/padding sides', () => {
    const rtl = getStartEnd(true);
    expect(rtl.marginStart).toBe('marginRight');
    expect(rtl.marginEnd).toBe('marginLeft');
    expect(rtl.paddingStart).toBe('paddingRight');
    expect(rtl.paddingEnd).toBe('paddingLeft');
  });

  it('returns LTR-correct margin/padding sides', () => {
    const ltr = getStartEnd(false);
    expect(ltr.marginStart).toBe('marginLeft');
    expect(ltr.marginEnd).toBe('marginRight');
    expect(ltr.paddingStart).toBe('paddingLeft');
    expect(ltr.paddingEnd).toBe('paddingRight');
  });
});
