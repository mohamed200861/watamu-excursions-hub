import { describe, expect, it } from 'vitest';
import { pageSeo, detailSeo } from '@/lib/seo';
import { legalComplete, legalSections } from '@/lib/legal';
import { SITE_URL } from '@/lib/site';
describe('seo rules', () => {
  it('uses the final domain', () => expect(SITE_URL).toBe('https://ecotoursandsafaris.it'));
  it('keeps titles ≤60 and descriptions ≤155, all unique', () => {
    const v = Object.values(pageSeo);
    v.forEach(([t, d]) => { expect(t.length).toBeLessThanOrEqual(60); expect(d.length).toBeLessThanOrEqual(155); });
    expect(new Set(v.map(x => x[0])).size).toBe(v.length);
    expect(new Set(v.map(x => x[1])).size).toBe(v.length);
  });
  it('clamps long package titles', () => { const [t, d] = detailSeo('it', 'safari', 'Mara Nakuru Amboseli 5 giorni 4 notti da Nairobi con lodge'); expect(t.length).toBeLessThanOrEqual(60); expect(d.length).toBeLessThanOrEqual(155); });
  it('legal pages incomplete without owner data and never show DA COMPLETARE', () => {
    expect(legalComplete({})).toBe(false);
    for (const k of ['privacy','cookie','terms'] as const) for (const l of ['it','en'] as const) expect(JSON.stringify(legalSections(k, l, {}))).not.toContain('DA COMPLETARE');
  });
});
