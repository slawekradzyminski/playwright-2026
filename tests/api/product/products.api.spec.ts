import { ProductClient } from '../../../http/productClient';
import { expect, test } from '../../../fixtures/loggedInUser.fixture';
import { expectValidProductCollection } from '../../../validators/productResponse';

test.describe('/api/v1/products API tests', () => {
  let productClient: ProductClient;

  test.beforeEach(({ request }) => {
    productClient = new ProductClient(request);
  });

  test('should return all products to an authenticated user - 200', async ({ loggedInUser }) => {
    // given

    // when
    const response = await productClient.getAllProducts(loggedInUser.token);

    // then
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expectValidProductCollection(await response.json());
  });

  test('should reject a request without a JWT token - 401', async () => {
    // given

    // when
    const response = await productClient.getAllProducts();

    // then
    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: 'Unauthorized' });
  });
});
