import { test, expect } from '../fixtures';
import { GraphQlClient } from '../../../http/graphql-client';
import { expectContentType } from '../support/content-type';
import type { GraphQlResponse } from '../../../types/graphql';
import { expectData, expectFieldError, expectValidationError } from './graphql-assertions';
import { PRODUCT, ROOT_FIELDS } from './queries';

const QUERY_FIELDS = ['products', 'product', 'cart', 'carts', 'orders', 'order', 'inventory', 'inventoryItem', 'inventoryMovements'];
const MUTATION_FIELDS = [
  'addCartItem', 'updateCartItem', 'removeCartItem', 'clearCart', 'checkout', 'cancelOrder',
  'updateOrderStatus', 'createProduct', 'updateProduct', 'deleteProduct', 'adjustInventory',
];

type RootType = { __type: { fields: { name: string }[] } };

test.describe('POST /api/v1/graphql - transport and execution', () => {
  test('describes the commerce query and mutation fields to a signed-in customer', async ({ graphql }) => {
    // when
    const queries = await graphql.client.execute(ROOT_FIELDS, { type: 'Query' });
    const mutations = await graphql.client.execute(ROOT_FIELDS, { type: 'Mutation' });

    // then
    const queryType = await expectData<RootType>(queries);
    const mutationType = await expectData<RootType>(mutations);
    expect(queryType.__type.fields.map(field => field.name)).toEqual(QUERY_FIELDS);
    expect(mutationType.__type.fields.map(field => field.name)).toEqual(MUTATION_FIELDS);
  });

  test('negotiates the GraphQL response media type when the client asks for it', async ({ graphql }) => {
    // when
    const response = await graphql.client.post({ query: '{ cart { totalItems } }' }, { Accept: 'application/graphql-response+json' });

    // then
    expect(response.status()).toBe(200);
    expectContentType(response, 'application/graphql-response+json');
    expect(await response.json()).toEqual({ data: { cart: { totalItems: 0 } } });
  });

  test('keeps permitted catalog data when an aliased inventory field is forbidden', async ({ graphql }) => {
    // given
    const product = await graphql.createProduct();

    // when
    const response = await graphql.client.execute(`query Mixed($id: ID!) {
      offer: product(id: $id) { id name }
      stock: inventoryItem(productId: $id, lowStockThreshold: 10) { availableQuantity }
    }`, { id: String(product.id) });

    // then
    const body = await expectFieldError(response, { field: 'stock', code: 'FORBIDDEN', message: 'Access denied' });
    expect(body.data).toEqual({ offer: { id: String(product.id), name: product.name }, stock: null });
  });

  test('keeps an earlier mutation committed when a later mutation in the same document fails', async ({ graphql }) => {
    // given
    const product = await graphql.createProduct();

    // when
    const response = await graphql.client.execute(`mutation TwoSteps($id: ID!) {
      first: addCartItem(productId: $id, quantity: 1) { totalItems }
      second: addCartItem(productId: $id, quantity: 0) { totalItems }
    }`, { id: String(product.id) });

    // then
    const body = await expectFieldError(response, { field: 'second', code: 'BAD_REQUEST' });
    expect(body.data).toEqual({ first: { totalItems: 1 }, second: null });
    await graphql.expectSavedCart([{ product, quantity: 1 }]);
  });

  test('rejects an unknown field before execution', async ({ graphql }) => {
    // when
    const response = await graphql.client.execute('{ cart { discountCode } }');

    // then
    await expectValidationError(response, /Field 'discountCode' in type 'Cart' is undefined/);
  });

  test('rejects a missing required variable before execution', async ({ graphql }) => {
    // when
    const response = await graphql.client.execute(PRODUCT);

    // then
    await expectValidationError(response, /Variable 'id' has coerced Null value for NonNull type 'ID!'/);
  });

  test('rejects an operation name that is not in the document', async ({ graphql }) => {
    // when
    const response = await graphql.client.execute(
      'query Cart { cart { totalItems } } query Orders { orders { total } }', undefined, 'Checkout',
    );

    // then
    await expectValidationError(response, "Unknown operation named 'Checkout'.");
  });

  test('rejects an aliased mutation above the complexity limit before changing the cart', async ({ graphql }) => {
    // given
    const product = await graphql.createProduct();
    const additions = Array.from({ length: 501 }, (_, index) =>
      `add${index}: addCartItem(productId: "${product.id}", quantity: 1) { totalItems }`);

    // when
    const response = await graphql.client.execute(`mutation Flood { ${additions.join(' ')} }`);

    // then
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ errors: [expect.objectContaining({
      message: 'maximum query complexity exceeded 1002 > 1000',
      extensions: { classification: 'ExecutionAborted' },
    })] });
    await graphql.expectSavedCart([]);
  });

  test('rejects a query nested deeper than the depth limit', async ({ graphql }) => {
    // given
    let selection = 'name';
    for (let level = 0; level < 22; level++) selection = `ofType { ${selection} }`;

    // when
    const response = await graphql.client.execute(`{ __schema { types { fields { type { ${selection} } } } } }`);

    // then
    const body: GraphQlResponse = await response.json();
    expect(response.status()).toBe(200);
    expect(body).toEqual({ errors: [expect.objectContaining({ message: 'maximum query depth exceeded 27 > 20' })] });
  });

  test('rejects malformed JSON - 400', async ({ graphql }) => {
    // when
    const response = await graphql.client.post('{"query":');

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ status: 400, error: 'Bad Request', path: '/api/v1/graphql' });
  });

  test('rejects HTTP batching of several operations - 400', async ({ graphql }) => {
    // when
    const response = await graphql.client.post([{ query: '{ cart { totalItems } }' }, { query: '{ orders { total } }' }]);

    // then
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ errors: [{ message: 'GraphQL HTTP batching is not supported' }] });
  });

  test('requires an access token - 401', async ({ request }) => {
    // when
    const response = await new GraphQlClient(request).execute('{ cart { totalItems } }');

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

  test('rejects an invalid access token - 401', async ({ request }) => {
    // when
    const response = await new GraphQlClient(request, 'invalid-token').execute('{ cart { totalItems } }');

    // then
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Invalid or expired token' });
  });

  test('rejects a request body above 64 KiB - 413', async ({ graphql }) => {
    // when
    const response = await graphql.client.post({ query: '{ cart { totalItems } }', variables: { note: 'x'.repeat(70_000) } });

    // then
    expect(response.status()).toBe(413);
    expect(await response.json()).toEqual({ errors: [{ message: 'GraphQL request exceeds 64 KiB' }] });
  });
});
