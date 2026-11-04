import { createHmac } from 'node:crypto';

const PERIOD_MS = 30_000;
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/** The 30-second slot an authenticator code belongs to (RFC 6238 time step). */
export function currentTimeStep(): number {
  return Math.floor(Date.now() / PERIOD_MS);
}

/** Six-digit authenticator code for a base32 secret, as an authenticator app would show it. */
export function totp(secret: string, timeStep = currentTimeStep()): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(timeStep));
  const digest = createHmac('sha1', decodeBase32(secret)).update(counter).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const code = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(code).padStart(6, '0');
}

function decodeBase32(secret: string): Buffer {
  const bits = [...secret.replace(/=+$/, '').toUpperCase()]
    .map(char => {
      const value = BASE32_ALPHABET.indexOf(char);
      if (value < 0) throw new Error(`Invalid base32 character "${char}" in TOTP secret`);
      return value.toString(2).padStart(5, '0');
    })
    .join('');
  const bytes = bits.match(/.{8}/g) ?? [];
  return Buffer.from(bytes.map(byte => parseInt(byte, 2)));
}
