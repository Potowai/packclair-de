import { describe, expect, it } from 'vitest';
import {
  attributeFromSearch,
  EMPTY_LEDGER,
  ensureOwnCode,
  exportLeadsCsv,
  makeReferralCode,
  readRefParam,
  recordConversion
} from '@/domain/referral/referral';
import { ReferralStore } from '@/app/referral-store';

describe('referral code', () => {
  it('generates a 6-char code from the custom alphabet', () => {
    const code = makeReferralCode(() => 0);
    expect(code).toMatch(/^[A-Z0-9]{6}$/);
  });

  it('uses the injected rng so it is deterministic in tests', () => {
    let i = 0;
    const seq = [0, 0.5, 0.99, 0.1, 0.2, 0.3];
    const code = makeReferralCode(() => seq[i++] ?? 0);
    expect(code).toHaveLength(6);
    expect(code).not.toContain('0'); // alphabet has no 0/1/O
  });
});

describe('readRefParam', () => {
  it('reads a ref from a query string', () => {
    expect(readRefParam('?ref=abc123')).toBe('ABC123');
  });
  it('returns null when absent or empty', () => {
    expect(readRefParam('?x=1')).toBeNull();
    expect(readRefParam('?ref=')).toBeNull();
  });
});

describe('ensureOwnCode', () => {
  it('assigns a code only once', () => {
    let s = ensureOwnCode(EMPTY_LEDGER, () => 0.1);
    expect(s.ownCode).toMatch(/^[A-Z0-9]{6}$/);
    const same = ensureOwnCode(s, () => 0.9);
    expect(same.ownCode).toBe(s.ownCode);
  });
});

describe('attributeFromSearch', () => {
  it('attributes a valid referrer from ?ref', () => {
    const s = ensureOwnCode(EMPTY_LEDGER, () => 0.1);
    const next = attributeFromSearch(s, '?ref=ZZZZ99');
    expect(next.attributedReferrer).toBe('ZZZZ99');
  });
  it('ignores self-referral', () => {
    const s = ensureOwnCode(EMPTY_LEDGER, () => 0.1);
    const next = attributeFromSearch(s, `?ref=${s.ownCode}`);
    expect(next.attributedReferrer).toBeNull();
  });
  it('does not overwrite an existing attribution', () => {
    let s = ensureOwnCode(EMPTY_LEDGER, () => 0.1);
    s = attributeFromSearch(s, '?ref=AAAA11');
    const next = attributeFromSearch(s, '?ref=BBBB22');
    expect(next.attributedReferrer).toBe('AAAA11');
  });
  it('rejects malformed referrer codes', () => {
    const s = ensureOwnCode(EMPTY_LEDGER, () => 0.1);
    expect(attributeFromSearch(s, '?ref=!!!').attributedReferrer).toBeNull();
  });
});

describe('recordConversion', () => {
  it('increments conversions', () => {
    const s = { ...EMPTY_LEDGER, conversions: 2 };
    expect(recordConversion(s).conversions).toBe(3);
  });
});

describe('exportLeadsCsv', () => {
  it('produces a header and one row crediting the referrer', () => {
    const s = { ownCode: 'OWN123', attributedReferrer: 'REF999', conversions: 4 };
    const csv = exportLeadsCsv(s);
    expect(csv).toContain('referrer_code,acquisitions_on_device,conversions_credited');
    expect(csv).toContain('REF999,1,4');
  });
  it('marks zero acquisitions when no referrer is attributed', () => {
    const csv = exportLeadsCsv(EMPTY_LEDGER);
    expect(csv).toContain(',0,0');
  });
});

describe('ReferralStore', () => {
  it('persists and reloads the ledger across instances', () => {
    const mem = new Map<string, string>();
    const kv: KeyValueStoreLike = {
      getItem: (k) => mem.get(k) ?? null,
      setItem: (k, v) => mem.set(k, v)
    };
    const a = new ReferralStore(kv as any);
    const owned = a.ensureOwnCode(() => 0.2);
    expect(owned.ownCode).not.toBeNull();

    const b = new ReferralStore(kv as any);
    expect(b.load().ownCode).toBe(owned.ownCode);
  });
});

interface KeyValueStoreLike {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}
