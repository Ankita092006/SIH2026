import { describe, it, expect } from 'vitest';
import { translations } from '../data/translations';

describe('Multilingual & Accessibility Architecture', () => {
  it('contains matching key hierarchies between English and Assamese translations', () => {
    expect(translations.en).toBeDefined();
    expect(translations.as).toBeDefined();

    expect(translations.en.nav).toBeDefined();
    expect(translations.as.nav).toBeDefined();

    const enNavKeys = Object.keys(translations.en.nav);
    const asNavKeys = Object.keys(translations.as.nav);

    expect(asNavKeys).toEqual(expect.arrayContaining(enNavKeys));
  });

  it('provides bilingual support for newly added intelligent systems', () => {
    expect(translations.en.nav.memory).toBe('Memory');
    expect(translations.as.nav.memory).toBe('স্মৃতি');

    expect(translations.en.nav.voice).toBe('Voice');
    expect(translations.as.nav.voice).toBe('কণ্ঠ');
  });
});
