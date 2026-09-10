import { test, expect } from '@playwright/test';
import { expectLoginJwt } from '../../validators/jwt-validator';

const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
const payload = () => ({ sub: 'admin', auth: [{ authority: 'ROLE_ADMIN' }], iat: Date.now() / 1000 - 10, exp: Date.now() / 1000 + 3600 });
const jwt = (claims: unknown = payload(), header: unknown = { alg: 'HS256' }) =>
  `${encode(header)}.${encode(claims)}.${Buffer.alloc(32).toString('base64url')}`;

// Synthetic signatures deliberately demonstrate that this is structural validation.
test('accepts a structurally valid login JWT', () => {
  expectLoginJwt(jwt(), 'admin', ['ROLE_ADMIN']);
});

for (const { name, token } of [
  { name: 'missing signature', token: () => 'e30.e30' },
  { name: 'invalid JSON', token: () => `bm90LWpzb24.${encode(payload())}.YWJj` },
  { name: 'array payload', token: () => jwt([]) },
  { name: 'unsigned algorithm', token: () => jwt(payload(), { alg: 'none' }) },
  { name: 'expired token', token: () => jwt({ ...payload(), exp: 1 }) },
  { name: 'wrong subject', token: () => jwt({ ...payload(), sub: 'another-user' }) },
  { name: 'wrong authorities', token: () => jwt({ ...payload(), auth: [] }) },
  { name: 'string expiry', token: () => jwt({ ...payload(), exp: '9999999999' }) },
  { name: 'future issuance', token: () => jwt({ ...payload(), iat: Date.now() / 1000 + 600 }) },
]) {
  test(`rejects ${name}`, () => {
    expect(() => expectLoginJwt(token(), 'admin', ['ROLE_ADMIN'])).toThrow();
  });
}
