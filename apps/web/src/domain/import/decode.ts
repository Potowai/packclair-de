import type { CsvEncoding } from './types';

const MAX_BYTES = 25 * 1024 * 1024;

export class ImportError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message ?? code);
    this.name = 'ImportError';
    this.code = code;
  }
}

export function decodeBytes(
  bytes: Uint8Array,
  options: { assumeEncoding?: 'windows-1252' } = {}
): { text: string; encoding: CsvEncoding; requiresConfirmation: boolean } {
  if (bytes.byteLength > MAX_BYTES) {
    throw new ImportError('FILE_TOO_LARGE', `max ${MAX_BYTES} bytes`);
  }

  if (bytes.byteLength >= 2) {
    if (bytes[0] === 0xff && bytes[1] === 0xfe) {
      const text = decodeUtf16(bytes, true);
      return { text, encoding: 'utf-16le', requiresConfirmation: false };
    }
    if (bytes[0] === 0xfe && bytes[1] === 0xff) {
      const text = decodeUtf16(bytes, false);
      return { text, encoding: 'utf-16be', requiresConfirmation: false };
    }
  }

  if (bytes.byteLength >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    const text = new TextDecoder('utf-8').decode(bytes.subarray(3));
    return { text, encoding: 'utf-8', requiresConfirmation: false };
  }

  const utf8Text = safeDecodeUtf8(bytes);
  if (utf8Text !== null) {
    return { text: utf8Text, encoding: 'utf-8', requiresConfirmation: false };
  }

  if (options.assumeEncoding === 'windows-1252') {
    const text = decodeWindows1252(bytes);
    return { text, encoding: 'windows-1252', requiresConfirmation: false };
  }

  return { text: '', encoding: 'windows-1252', requiresConfirmation: true };
}

function safeDecodeUtf8(bytes: Uint8Array): string | null {
  const buffer = bytes.slice();
  const decoded = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
  for (let i = 0; i < decoded.length; i++) {
    const cp = decoded.codePointAt(i);
    if (cp === undefined || (cp >= 0xfffd && cp <= 0xfffe)) {
      return null;
    }
  }
  return decoded;
}

function decodeUtf16(bytes: Uint8Array, littleEndian: boolean): string {
  const view = bytes.subarray(littleEndian ? 2 : 0);
  const buf = new Uint8Array(view);
  return new TextDecoder('utf-16le', { fatal: true }).decode(
    littleEndian ? buf : swapBytes(buf)
  );
}

function swapBytes(buf: Uint8Array): Uint8Array {
  const out = new Uint8Array(buf.byteLength);
  for (let i = 0; i < buf.byteLength; i += 2) {
    out[i] = buf[i + 1] ?? 0;
    out[i + 1] = buf[i] ?? 0;
  }
  return out;
}

const WIN1252_MAP: Record<number, string> = {
  0x80: '€', 0x82: '‚', 0x83: 'ƒ', 0x84: '„', 0x85: '…', 0x86: '†',
  0x87: '‡', 0x88: 'ˆ', 0x89: '‰', 0x8a: 'Š', 0x8b: '‹', 0x8c: 'Œ',
  0x91: '‘', 0x92: '’', 0x93: '“', 0x94: '”', 0x95: '•', 0x96: '–',
  0x97: '—', 0x98: '˜', 0x99: '™', 0x9a: 'š', 0x9b: '›', 0x9c: 'œ',
  0x9f: 'Ÿ'
};

export function decodeWindows1252(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    const b = bytes[i] as number;
    if (b < 0x80) out += String.fromCharCode(b);
    else if (WIN1252_MAP[b] !== undefined) out += WIN1252_MAP[b];
    else if (b >= 0xa0) out += String.fromCharCode(b);
    else out += '?';
  }
  return out;
}

export async function hashBytes(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes as unknown as BufferSource);
  const arr = Array.from(new Uint8Array(digest));
  return arr.map((b) => b.toString(16).padStart(2, '0')).join('');
}
