import { ProductClient } from '../../http/productClient';
import { expect, test } from '../../fixtures/loggedInUser.fixture';
import type { ProductDto } from '../../types/product';
import { expectValidProduct, expectValidProductCollection } from '../../validators/productResponse';

const UNKNOWN_PRODUCT_ID = '9223372036854775807';

test.describe('/api/v1/products/{id} API tests', () => {
  let productClient: ProductClient;

  test.beforeEach(({ request }) => {
    productClient = new ProductClient(request);
  });

  test('should return a product by its ID to an authenticated user - 200', async ({
    loggedInUser
  }) => {
    // given
    const productsResponse = await productClient.getAllProducts(loggedInUser.token);
    expect(productsResponse.status()).toBe(200);
    const products = (await productsResponse.json()) as ProductDto[];
    expectValidProductCollection(products);
    const productId = products[0].id;

    // when
    const response = await productClient.getProductById(productId, loggedInUser.token);

    // then
    expect(response.status()).toBe(200);
    expectValidProduct(await response.json());
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
    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: 'Unauthorized' });
  });

  test('should return not found for an unknown product ID - 404', async ({
    loggedInUser
  }) => {
    // when
    const response = await productClient.getProductById(UNKNOWN_PRODUCT_ID, loggedInUser.token);

    // then
    expect(response.status()).toBe(404);
    await expect(response.json()).resolves.toEqual({ message: 'Product not found' });
  });
});
