// API smoke coverage verifies validation wiring and error mapping.
// Exhaustive field constraints and boundary combinations belong in backend unit tests.
export const invalidProductCases = [
  { label: 'zero price', field: 'price', value: 0 }
];
export const validProductCases = [
  { label: 'all fields', overrides: {} },
  { label: 'minimum boundaries', overrides: { name: 'abc', description: 'x', price: 0.01, stockQuantity: 0, imageUrl: '' } },
  { label: 'maximum string boundaries', overrides: { name: 'x'.repeat(100), description: 'x'.repeat(1000) } },
  { label: 'HTTP image URL', overrides: { imageUrl: 'http://example.test/image' } },
  { label: 'omitted image URL', overrides: { imageUrl: undefined } }
];
export const INVALID_PRODUCT_ID = 'not-a-number';
export const unauthorizedCases = [
  { label: 'missing token', token: undefined, message: 'Unauthorized' },
  { label: 'invalid token', token: 'invalid-token', message: 'Invalid or expired token' }
];
