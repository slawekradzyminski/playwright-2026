import { test, expect } from './graphql.fixtures';
import { CartPage } from '../../../pages/cart.page';
import { CommerceTransportSelector } from '../../../pages/components/commerce-transport.component';
import { waitForOperation, waitForRestCart } from './graphql-network';

// These scenarios use the real selector, so the browser starts on the application default.
test.use({ commerceTransport: undefined });

test.describe('Shop API selector', () => {
  test('starts in REST mode and loads the cart from the REST API', async ({ shop, cartPage, shopApi, commerceTraffic }) => {
    // given
    const product = await shop.createProduct();
    await shop.addToCart(product, 1);

    // when
    await cartPage.goto();

    // then
    await expect(cartPage.itemName(product.id)).toHaveText(product.name);
    await expect(shopApi.select).toHaveValue('rest');
    expect(commerceTraffic.restCommerceRequests).toContain('GET /api/v1/cart');
    expect(commerceTraffic.operations).toEqual([]);
  });

  test('switches to GraphQL and back without losing the page, session or cart', async ({ page, shop, productDetails, shopApi }) => {
    // given
    const product = await shop.createProduct();
    await shop.addToCart(product, 2);
    await productDetails.goto(product.id);
    await expect(productDetails.inCart).toHaveText('2 in cart');

    // when
    const graphqlCart = waitForOperation(page, 'Cart');
    await shopApi.choose('GraphQL');

    // then
    expect((await graphqlCart).ok()).toBe(true);
    await expect(page).toHaveURL(`/products/${product.id}`);
    await expect(shopApi.select).toHaveValue('graphql');
    await expect(productDetails.inCart).toHaveText('2 in cart');

    // when
    await page.reload();

    // then
    await expect(shopApi.select).toHaveValue('graphql');
    await expect(productDetails.inCart).toHaveText('2 in cart');

    // when
    const restCart = waitForRestCart(page);
    await shopApi.choose('REST');

    // then
    expect((await restCart).ok()).toBe(true);
    await expect(shopApi.select).toHaveValue('rest');
    await expect(productDetails.inCart).toHaveText('2 in cart');
  });

  test('keeps the choice in the current browser session only', async ({ context, browser, baseURL, cartPage, shopApi }) => {
    // given
    await cartPage.goto();
    await shopApi.choose('GraphQL');

    // when
    const otherContext = await browser.newContext({ baseURL, storageState: await context.storageState() });
    try {
      const otherPage = await otherContext.newPage();
      await otherPage.goto('/cart');

      // then
      await expect(new CartPage(otherPage).title).toHaveText('Your Cart');
      await expect(new CommerceTransportSelector(otherPage).select).toHaveValue('rest');
      await expect(shopApi.select).toHaveValue('graphql');
    } finally {
      await otherContext.close();
    }
  });

  test('is labelled and can be changed with the keyboard', async ({ page, cartPage, shopApi }) => {
    // given
    await cartPage.goto();
    await shopApi.select.focus();

    // when
    const graphqlCart = waitForOperation(page, 'Cart');
    await page.keyboard.press('g'); // type-ahead selects GraphQL

    // then
    expect((await graphqlCart).ok()).toBe(true);
    await expect(shopApi.select).toHaveValue('graphql');
    await expect(cartPage.title).toHaveText('Your Cart');
  });
});
