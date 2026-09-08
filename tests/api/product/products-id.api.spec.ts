import { expectJson } from '../../../validators/jsonResponse';
import { ProductClient } from '../../../http/productClient';
import { expect, test } from '../../../fixtures/products.fixture';
import { generateProduct } from '../../../generators/productGenerator';
import { expectValidProduct } from '../../../validators/productResponse';

const UNKNOWN_PRODUCT_ID = '9223372036854775807';

test.describe('/api/v1/products/{id} API tests', () => {
  let productClient: ProductClient;

  test.beforeEach(({ request }) => {
    productClient = new ProductClient(request);
  });

  test('should return a product by its ID to an authenticated user - 200', async ({
    loggedInUser, adminToken, productIds
  }) => {
    // given
    const payload = generateProduct();
    const created = await productClient.createProduct(payload, adminToken);
    const product = await created.json();
    if (product.id) productIds.add(product.id);
    expect(created.status()).toBe(201);
    const productId = product.id;

    // when
    const response = await productClient.getProductById(productId, loggedInUser.token);

    // then
    const body = await expectJson(response, 200);
    expectValidProduct(body);
    expect(body).toEqual(product);
  });

  test('should reject a non-numeric product ID - 400', async ({ loggedInUser }) => {
    // when
    const response = await productClient.getProductById('not-a-number', loggedInUser.token);

    // then
    expect(response.status()).toBe(400);
  });

  test('should reject a request without a JWT token - 401', async () => {
    // when
    const response = await productClient.getProductById(1);

    // then
    expect(await expectJson(response, 401)).toEqual({ message: 'Unauthorized' });
  });

  test('should return not found for an unknown product ID - 404', async ({
    loggedInUser
  }) => {
    // when
    const response = await productClient.getProductById(UNKNOWN_PRODUCT_ID, loggedInUser.token);

    // then
    expect(await expectJson(response, 404)).toEqual({ message: 'Product not found' });
  });
});
