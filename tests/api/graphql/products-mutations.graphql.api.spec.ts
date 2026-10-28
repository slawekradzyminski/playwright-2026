import { randomUUID } from 'node:crypto';
import { test, expect } from '../fixtures';
import { generateProduct } from '../../../generators/product-generator';
import { expectProduct } from '../products/product-assertions';
import type { GqlProduct } from '../../../types/graphql';
import type { ProductDto } from '../../../types/product';
import { expectData, expectFieldError, expectGqlProduct } from './graphql-assertions';
import { productInput } from './graphql-test-context';
import { CREATE_PRODUCT, DELETE_PRODUCT, UPDATE_PRODUCT } from './mutations';

const MISSING_PRODUCT_ID = '999999999';

test.describe('GraphQL products mutations', () => {
  test.describe('Mutation.createProduct', () => {
    test('lets an administrator publish a product that REST clients can read', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = { ...generateProduct(), price: 249.99 };

      // when
      const response = await graphqlAdmin.execute(CREATE_PRODUCT, { input: productInput(product) });
      await graphql.trackCreatedProduct(response);

      // then
      const { createProduct } = await expectData<{ createProduct: GqlProduct }>(response);
      expectGqlProduct(createProduct, product);
      expectProduct(await graphql.savedProduct(createProduct.id), product);
    });

    test('rejects a price with more than two decimals without creating a product - BAD_REQUEST', async ({ graphql, graphqlAdmin }) => {
      // given
      const category = `GraphQL invalid ${randomUUID()}`;

      // when
      const response = await graphqlAdmin.execute(CREATE_PRODUCT, {
        input: { ...productInput({ ...generateProduct(), category }), price: '10.999' },
      });
      await graphql.trackCreatedProduct(response);

      // then
      await expectFieldError(response, { field: 'createProduct', code: 'BAD_REQUEST' });
      await graphql.expectCategorySize(category, 0);
    });

    test('forbids customers from publishing products - FORBIDDEN', async ({ graphql }) => {
      // given
      const category = `GraphQL forbidden ${randomUUID()}`;

      // when
      const response = await graphql.client.execute(CREATE_PRODUCT, {
        input: productInput({ ...generateProduct(), category }),
      });
      await graphql.trackCreatedProduct(response);

      // then
      await expectFieldError(response, { field: 'createProduct', code: 'FORBIDDEN', message: 'Access denied' });
      await graphql.expectCategorySize(category, 0);
    });
  });

  test.describe('Mutation.updateProduct', () => {
    test('changes only the supplied fields and treats null as unchanged', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct();

      // when
      const response = await graphqlAdmin.execute(UPDATE_PRODUCT, {
        id: String(product.id), input: { price: '15.00', description: 'Refreshed description', name: null },
      });

      // then
      const expected: ProductDto = { ...product, price: 15, description: 'Refreshed description' };
      const { updateProduct } = await expectData<{ updateProduct: GqlProduct }>(response);
      expectGqlProduct(updateProduct, expected, product.id);
      expect(await graphql.savedProduct(product.id)).toMatchObject({ name: product.name, price: 15, description: 'Refreshed description' });
    });

    test('forbids customers from changing a product - FORBIDDEN', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct();

      // when
      const response = await graphql.client.execute(UPDATE_PRODUCT, { id: String(product.id), input: { price: '0.01' } });

      // then
      await expectFieldError(response, { field: 'updateProduct', code: 'FORBIDDEN' });
      expect(await graphql.savedProduct(product.id)).toEqual(product);
    });

    test('reports a missing product - NOT_FOUND', async ({ graphqlAdmin }) => {
      // when
      const response = await graphqlAdmin.execute(UPDATE_PRODUCT, { id: MISSING_PRODUCT_ID, input: { name: 'Renamed product' } });

      // then
      await expectFieldError(response, { field: 'updateProduct', code: 'NOT_FOUND', message: 'Product not found' });
    });
  });

  test.describe('Mutation.deleteProduct', () => {
    test('removes an unreferenced product and reports false when it is already gone', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct();

      // when
      const response = await graphqlAdmin.execute(DELETE_PRODUCT, { id: String(product.id) });

      // then
      expect(await expectData(response)).toEqual({ deleteProduct: true });
      graphql.forgetProduct(product);
      await graphql.expectProductDeleted(product.id);

      // when
      const repeated = await graphqlAdmin.execute(DELETE_PRODUCT, { id: String(product.id) });

      // then
      expect(await expectData(repeated)).toEqual({ deleteProduct: false });
    });

    test('forbids customers from deleting a product - FORBIDDEN', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct();

      // when
      const response = await graphql.client.execute(DELETE_PRODUCT, { id: String(product.id) });

      // then
      await expectFieldError(response, { field: 'deleteProduct', code: 'FORBIDDEN' });
      expect(await graphql.savedProduct(product.id)).toEqual(product);
    });

    test('keeps a product that is still in a customer cart - CONFLICT', async ({ graphql, graphqlAdmin }) => {
      // given
      const product = await graphql.createProduct();
      await graphql.addToCart(product, 1);

      // when
      const response = await graphqlAdmin.execute(DELETE_PRODUCT, { id: String(product.id) });

      // then
      await expectFieldError(response, {
        field: 'deleteProduct', code: 'CONFLICT', message: 'Product is referenced by existing data',
      });
      await graphql.expectSavedCart([{ product, quantity: 1 }]);
    });
  });
});
