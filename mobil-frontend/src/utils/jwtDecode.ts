import type { JwtPayload } from '@/types';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodeBase64(base64: string): string {
  let output = '';
  let buffer = 0;
  let bitsCollected = 0;

  for (const char of base64) {
    if (char === '=') {
      break;
    }

    const value = BASE64_CHARS.indexOf(char);
    if (value < 0) {
      continue;
    }

    buffer = (buffer << 6) | value;
    bitsCollected += 6;

    if (bitsCollected >= 8) {
      bitsCollected -= 8;
      const codePoint = (buffer >> bitsCollected) & 0xff;
      output += String.fromCharCode(codePoint);
    }
  }

  return output;
}

function decodeBase64Url(base64Url: string): string {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = decodeBase64(padded);

  const utf8 = binary
    .split('')
    .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
    .join('');

  return decodeURIComponent(utf8);
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    const decodedPayload = decodeBase64Url(parts[1]);
    return JSON.parse(decodedPayload) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload) {
    return true;
  }

  return Date.now() >= payload.exp * 1000;
}
