import { expectJson } from '../../../validators/jsonResponse';
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
    expectValidProductCollection(await expectJson(response, 200));
  });

  test('should reject a request without a JWT token - 401', async () => {
    // given

    // when
    const response = await productClient.getAllProducts();

    // then
    expect(await expectJson(response, 401)).toEqual({ message: 'Unauthorized' });
  });
});
