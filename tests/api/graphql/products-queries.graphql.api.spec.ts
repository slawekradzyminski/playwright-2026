import { randomUUID } from 'node:crypto';
import { test, expect } from '../fixtures';
import type { GqlProduct, GqlProductPage } from '../../../types/graphql';
import { expectData, expectFieldError, expectGqlProduct } from './graphql-assertions';
import { PRODUCT, PRODUCTS } from './queries';

const MISSING_PRODUCT_ID = '999999999';

test.describe('GraphQL products queries', () => {
  test.describe('Query.products', () => {
    test('pages through a category with exact decimal prices', async ({ graphql }) => {
      // given
      const category = `GraphQL catalog ${randomUUID()}`;
      const first = await graphql.createProduct({ category, price: 12.5 });
      const second = await graphql.createProduct({ category, price: 0.99 });
      const third = await graphql.createProduct({ category, price: 1999 });

      // when
      const firstPage = await graphql.client.execute(PRODUCTS, { offset: 0, limit: 2, category });
      const secondPage = await graphql.client.execute(PRODUCTS, { offset: 2, limit: 2, category });

      // then
      const { products: page1 } = await expectData<{ products: GqlProductPage }>(firstPage);
      const { products: page2 } = await expectData<{ products: GqlProductPage }>(secondPage);
      expect(page1).toMatchObject({ total: 3, offset: 0, limit: 2 });
      expect(page2).toMatchObject({ total: 3, offset: 2, limit: 2 });
      expect([...page1.items, ...page2.items].map(product => product.id))
        .toEqual([first, second, third].map(product => String(product.id)));
      expect(page1.items.map(product => product.price)).toEqual(['12.50', '0.99']);
      expectGqlProduct(page2.items[0], third, third.id);
    });

    test('hides sold-out products when only in-stock items are requested', async ({ graphql }) => {
      // given
      const category = `GraphQL stock ${randomUUID()}`;
      const available = await graphql.createProduct({ category, stockQuantity: 2 });
      await graphql.createProduct({ category, stockQuantity: 0 });

      // when
      const response = await graphql.client.execute(PRODUCTS, { offset: 0, limit: 10, category, inStockOnly: true });

      // then
      const { products } = await expectData<{ products: GqlProductPage }>(response);
      expect(products.total).toBe(1);
      expect(products.items.map(product => product.id)).toEqual([String(available.id)]);
    });

    test('rejects a page larger than 100 products - BAD_REQUEST', async ({ graphql }) => {
      // when (a small selection keeps the request below the complexity limit)
      const response = await graphql.client.execute('{ products(limit: 101) { total } }');

      // then
      await expectFieldError(response, {
        field: 'products', code: 'BAD_REQUEST', message: 'Invalid query arguments or mutation input',
      });
    });
  });

  test.describe('Query.product', () => {
    test('returns a product created through REST with GraphQL wire types', async ({ graphql }) => {
      // given
      const product = await graphql.createProduct({ price: 39.9 });

      // when
      const response = await graphql.client.execute(PRODUCT, { id: String(product.id) });

      // then
      const { product: body } = await expectData<{ product: GqlProduct }>(response);
      expectGqlProduct(body, product, product.id);
      expect(body.price).toBe('39.90');
    });

    test('reports a missing product - NOT_FOUND', async ({ graphql }) => {
      // when
      const response = await graphql.client.execute(PRODUCT, { id: MISSING_PRODUCT_ID });

      // then
      await expectFieldError(response, { field: 'product', code: 'NOT_FOUND', message: 'Product not found' });
    });
  });
});
