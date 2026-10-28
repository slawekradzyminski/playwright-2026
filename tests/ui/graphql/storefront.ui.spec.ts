import { test, expect } from './graphql.fixtures';
import { ProductsPage } from '../../../pages/products.page';
import { expireTokenOnce, failOperation, recordCatalogOffsets, waitForOperation } from './graphql-network';

test.describe('GraphQL storefront', () => {
  test('shows a product that is beyond the first catalog page', async ({ page, shop }) => {
    // given
    const lastProduct = await shop.createProductBeyondFirstCatalogPage({ price: 7.25 });
    const offsets = recordCatalogOffsets(page);
    const products = new ProductsPage(page);

    // when
    await products.goto();
    await products.search(lastProduct.name);

    // then
    await expect(products.card(lastProduct.name).price).toHaveText('$7.25');
    expect(offsets).toEqual(expect.arrayContaining([0, 25]));
  });

  test('adds a product to the cart from its details page', async ({ page, shop, productDetails, commerceTraffic }) => {
    // given
    const product = await shop.createProduct({ price: 9.99, stockQuantity: 3 });
    await productDetails.goto(product.id);
    await expect(productDetails.price).toHaveText('$9.99');
    await productDetails.increase();

    // when
    const added = waitForOperation(page, 'AddCartItem');
    await productDetails.save();

    // then
    expect((await added).ok()).toBe(true);
    await productDetails.toast.expectSuccess(`2 × ${product.name} added to your cart`);
    await expect(productDetails.inCart).toHaveText('2 in cart');
    await shop.expectSavedCart([{ product, quantity: 2 }]);
    expect(commerceTraffic.restCommerceRequests).toEqual([]);
  });

  test('keeps the saved cart when GraphQL rejects an update and accepts a retry', async ({ page, shop, productDetails }) => {
    // given
    const product = await shop.createProduct();
    await shop.addToCart(product, 1);
    await productDetails.goto(product.id);
    await productDetails.increase();
    await failOperation(page, 'UpdateCartItem', { field: 'updateCartItem', code: 'CONFLICT', message: 'Insufficient stock' });

    // when
    await productDetails.save();

    // then
    await productDetails.toast.expectFailure('Failed to update cart. Please try again.');
    await expect(productDetails.inCart).toHaveText('1 in cart');
    await shop.expectSavedCart([{ product, quantity: 1 }]);

    // when
    await page.unrouteAll();
    await productDetails.save();

    // then
    await productDetails.toast.expectSuccess(`${product.name} quantity set to 2`);
    await shop.expectSavedCart([{ product, quantity: 2 }]);
  });

  test('shows enriched cart lines and saves quantity changes without per-item lookups', async ({ page, shop, cartPage, commerceTraffic }) => {
    // given
    const lamp = await shop.createProduct({ price: 12.5 });
    const mug = await shop.createProduct({ price: 3.25 });
    await shop.addToCart(lamp, 2);
    await shop.addToCart(mug, 1);
    await cartPage.goto();
    await expect(cartPage.itemName(lamp.id)).toHaveText(lamp.name);
    await expect(cartPage.itemName(mug.id)).toHaveText(mug.name);
    await expect(cartPage.summaryTotal).toHaveText('$28.25');

    // when
    const updated = waitForOperation(page, 'UpdateCartItem');
    await cartPage.increaseItem(lamp.id);
    await cartPage.updateItem(lamp.id);

    // then
    expect((await updated).ok()).toBe(true);
    await expect(cartPage.itemQuantity(lamp.id)).toHaveText('3');
    await expect(cartPage.summaryTotal).toHaveText('$40.75');
    await shop.expectSavedCart([{ product: lamp, quantity: 3 }, { product: mug, quantity: 1 }]);
    expect(commerceTraffic.operations).not.toContain('Product');
    expect(commerceTraffic.restCommerceRequests).toEqual([]);

    // when
    await cartPage.clearWithConfirmation(true);

    // then
    await expect(cartPage.emptyState).toContainText('Your cart is empty');
    await shop.expectSavedCart([]);
  });

  test('shows a cart error without signing out or falling back to REST, then recovers', async ({ page, shop, cartPage, header, commerceTraffic }) => {
    // given
    const product = await shop.createProduct();
    await shop.addToCart(product, 1);
    await failOperation(page, 'Cart', { field: 'cart', code: 'BAD_REQUEST', message: 'Cart unavailable' });

    // when
    await cartPage.goto();

    // then
    await expect(cartPage.loadError).toBeVisible({ timeout: 15_000 });
    await expect(header.logoutButton).toBeVisible();
    expect(commerceTraffic.restCommerceRequests).toEqual([]);

    // when
    await page.unrouteAll();
    await cartPage.retryButton.click();

    // then
    await expect(cartPage.itemName(product.id)).toHaveText(product.name);
  });

  test('refreshes an expired access token and resumes loading the cart', async ({ page, shop, cartPage, header, commerceTraffic }) => {
    // given
    const product = await shop.createProduct();
    await shop.addToCart(product, 2);
    await expireTokenOnce(page, 'Cart');

    // when
    await cartPage.goto();

    // then
    await expect(cartPage.itemQuantity(product.id)).toHaveText('2');
    await expect(header.logoutButton).toBeVisible();
    expect(commerceTraffic.tokenRefreshes).toBe(1);
  });
});
