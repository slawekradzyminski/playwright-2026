import type { Page } from '@playwright/test';
import { test, expect } from '../graphql/graphql.fixtures';
import { waitForOperation, waitForRestCart } from '../graphql/graphql-network';

function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

test.use({ isMobile: true, hasTouch: true, commerceTransport: undefined });

test.describe('Shop API selector on a phone', () => {
  test.use({ viewport: { width: 402, height: 874 } });

  test('switches the cart to GraphQL without overflowing the page', async ({ page, shop, cartPage, shopApi }) => {
    // given
    const product = await shop.createProduct({ price: 12.5 });
    await shop.addToCart(product, 2);
    await cartPage.goto();
    await expect(shopApi.select).toHaveValue('rest');

    // when
    const graphqlCart = waitForOperation(page, 'Cart');
    await shopApi.choose('GraphQL');

    // then
    expect((await graphqlCart).ok()).toBe(true);
    await expect(shopApi.select).toHaveValue('graphql');
    await expect(cartPage.summaryTotal).toHaveText('$25.00');
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
});

test.describe('Shop API selector on a tablet in portrait', () => {
  test.use({ viewport: { width: 820, height: 1180 } });

  test('switches product details to GraphQL and keeps the cart quantity', async ({ page, shop, productDetails, shopApi }) => {
    // given
    const product = await shop.createProduct();
    await shop.addToCart(product, 1);
    await productDetails.goto(product.id);
    await expect(productDetails.inCart).toHaveText('1 in cart');

    // when
    const graphqlCart = waitForOperation(page, 'Cart');
    await shopApi.choose('GraphQL');

    // then
    expect((await graphqlCart).ok()).toBe(true);
    await expect(productDetails.inCart).toHaveText('1 in cart');
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
});

test.describe('Shop API selector on a tablet in landscape', () => {
  test.use({ viewport: { width: 1180, height: 820 } });

  test('switches the cart back to REST after GraphQL', async ({ page, shop, cartPage, shopApi }) => {
    // given
    const product = await shop.createProduct({ price: 3.25 });
    await shop.addToCart(product, 2);
    await cartPage.goto();
    await shopApi.choose('GraphQL');
    await expect(cartPage.summaryTotal).toHaveText('$6.50');

    // when
    const restCart = waitForRestCart(page);
    await shopApi.choose('REST');

    // then
    expect((await restCart).ok()).toBe(true);
    await expect(shopApi.select).toHaveValue('rest');
    await expect(cartPage.summaryTotal).toHaveText('$6.50');
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
});
