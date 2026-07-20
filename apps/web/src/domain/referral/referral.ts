export interface ReferralLedger {
  /** The device owner's own referral code (assigned once). */
  ownCode: string | null;
  /** Referrer code attributed to this device from a ?ref= link, if any. */
  attributedReferrer: string | null;
  /** Declarations completed on this device, credited to the attributed referrer. */
  conversions: number;
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function makeReferralCode(rng: () => number = Math.random): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += ALPHABET[Math.floor(rng() * ALPHABET.length)];
  }
  return code;
}

export function readRefParam(search: string | URLSearchParams): string | null {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search;
  const ref = params.get('ref');
  return ref && ref.trim().length > 0 ? ref.trim().toUpperCase() : null;
}

export function ensureOwnCode(state: ReferralLedger, rng: () => number = Math.random): ReferralLedger {
  if (state.ownCode) return state;
  return { ...state, ownCode: makeReferralCode(rng) };
}

export function attributeFromSearch(
  state: ReferralLedger,
  search: string | URLSearchParams
): ReferralLedger {
  const ref = readRefParam(search);
  if (!ref) return state;
  if (state.attributedReferrer) return state;
  if (state.ownCode && ref === state.ownCode) return state;
  if (!/^[A-Z0-9]{4,12}$/.test(ref)) return state;
  return { ...state, attributedReferrer: ref };
}

export function recordConversion(state: ReferralLedger): ReferralLedger {
  return { ...state, conversions: state.conversions + 1 };
}

export function exportLeadsCsv(state: ReferralLedger): string {
  const rows = [
    ['referrer_code', 'acquisitions_on_device', 'conversions_credited'].join(','),
    [state.attributedReferrer ?? '', state.attributedReferrer ? 1 : 0, String(state.conversions)].join(',')
  ];
  return rows.join('\n') + '\n';
}

export const EMPTY_LEDGER: ReferralLedger = {
  ownCode: null,
  attributedReferrer: null,
  conversions: 0
};
