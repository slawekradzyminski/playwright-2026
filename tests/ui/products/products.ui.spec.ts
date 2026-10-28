import { test, expect } from './products.fixtures';
import { CART_ITEMS_ENDPOINT } from '../../../http/cart-client';
import { expectCart } from '../../api/cart/cart-test-context';

test.describe('Product catalog', () => {
  test('filters by category and restores all products with their catalog data', async ({ products, catalog }) => {
    // given
    await products.goto();
    await products.search(catalog.prefix);
    await expect(products.title).toHaveText('Products');
    const alpha = products.card(catalog.alpha.name);
    await expect(alpha.description).toHaveText(catalog.alpha.description);
    await expect(alpha.price).toHaveText('$9.99');
    await expect(alpha.category).toHaveText(catalog.alpha.category);

    // when
    await products.selectCategory(catalog.alpha.category);

    // then
    await expect(products.productNames).toHaveText([catalog.alpha.name, catalog.beta.name]);

    // when
    await products.showAllCategories();

    // then
    await expect(products.productNames).toHaveText([
      catalog.alpha.name, catalog.beta.name, catalog.delta.name, catalog.gamma.name,
    ]);
  });

  test('searches partial names ignoring case and surrounding whitespace', async ({ products, catalog }) => {
    // given
    await products.goto();

    // when
    await products.search(`  ${catalog.alpha.name.toUpperCase().slice(0, -2)}  `);

    // then
    await expect(products.productNames).toHaveText([catalog.alpha.name]);
    await expect(products.clearSearchButton).toHaveAccessibleName('Clear search');

    // when
    await products.clearSearchWithKeyboard();

    // then
    await expect(products.searchInput).toHaveValue('');
    await expect(products.card(catalog.beta.name).root).toBeVisible();
  });

  test('combines category, search and stock filters', async ({ products, catalog }) => {
    // given
    await products.goto();
    await products.search(catalog.prefix);
    await products.selectCategory(catalog.alpha.category);
    await expect(products.productNames).toHaveText([catalog.alpha.name, catalog.beta.name]);

    // when
    await products.showInStockOnly();

    // then
    await expect(products.productNames).toHaveText([catalog.alpha.name]);
  });

  test('recovers from a search with no matching products', async ({ products, catalog }) => {
    // given
    await products.goto();
    await products.selectCategory(catalog.alpha.category);

    // when
    await products.search(`${catalog.prefix} no-such-product`);

    // then
    await expect(products.emptyMessage).toContainText('No products found');
    await expect(products.productNames).toHaveCount(0);

    // when
    await products.clearEmptySearch();

    // then
    await expect(products.searchInput).toHaveValue('');
    await expect(products.emptyMessage).toBeHidden();
    await expect(products.productNames).toHaveText([catalog.alpha.name, catalog.beta.name]);
  });

  test('sorts prices numerically from lowest to highest', async ({ products, catalog }) => {
    // given
    await products.goto();
    await products.search(catalog.prefix);

    // when
    await products.sortByPrice('ascending');

    // then
    await expect(products.productNames).toHaveText([
      catalog.delta.name, catalog.alpha.name, catalog.gamma.name, catalog.beta.name,
    ]);
  });

  test('sorts prices numerically from highest to lowest', async ({ products, catalog }) => {
    // given
    await products.goto();
    await products.search(catalog.prefix);

    // when
    await products.sortByPrice('descending');

    // then
    await expect(products.productNames).toHaveText([
      catalog.beta.name, catalog.gamma.name, catalog.alpha.name, catalog.delta.name,
    ]);
  });

  test('adds the selected quantity and preserves it after reload', async ({ products, catalog, clientCart, authenticatedUser }) => {
    // given
    await products.goto();
    await products.search(catalog.prefix);
    const alpha = products.card(catalog.alpha.name);
    await alpha.increaseQuantity();

    // when
    await alpha.saveToCart();

    // then
    await products.toast.expectDescription(`2 × ${catalog.alpha.name} added to your cart`);
    await expect(alpha.inCart).toHaveText('2 in cart');
    await products.expectUrl();

    // when
    await products.reload();

    // then
    await expect(alpha.inCart).toHaveText('2 in cart');
    await expect(alpha.quantity).toHaveText('2');
    await expect(alpha.addButton).toHaveText('Update Cart');
    const response = await clientCart.getCart();
    expect(response.status()).toBe(200);
    expectCart(await response.json(), authenticatedUser.username, [{ product: catalog.alpha, quantity: 2 }]);
  });

  test('replaces an existing cart quantity without duplicating the item', async ({ products, catalog, clientCart, authenticatedUser }) => {
    // given
    const setup = await clientCart.addItem({ productId: catalog.alpha.id, quantity: 2 });
    expect(setup.status()).toBe(200);
    await products.goto();
    await products.search(catalog.prefix);
    const alpha = products.card(catalog.alpha.name);
    await expect(alpha.inCart).toHaveText('2 in cart');
    await alpha.decreaseQuantity();

    // when
    await alpha.saveToCart();

    // then
    await products.toast.expectDescription(`${catalog.alpha.name} quantity set to 1`);
    await expect(alpha.inCart).toHaveText('1 in cart');
    const response = await clientCart.getCart();
    expect(response.status()).toBe(200);
    expectCart(await response.json(), authenticatedUser.username, [{ product: catalog.alpha, quantity: 1 }]);
  });

  test('removes an item with the dedicated Remove button', async ({ products, catalog, clientCart, authenticatedUser }) => {
    // given
    const setup = await clientCart.addItem({ productId: catalog.alpha.id, quantity: 2 });
    expect(setup.status()).toBe(200);
    await products.goto();
    await products.search(catalog.prefix);
    const alpha = products.card(catalog.alpha.name);
    await expect(alpha.inCart).toHaveText('2 in cart');

    // when
    await alpha.removeFromCart();

    // then
    await products.toast.expectDescription(`${catalog.alpha.name} has been removed from your cart`);
    await expect(alpha.inCart).toBeHidden();
    await expect(alpha.removeButton).toBeHidden();
    await expect(alpha.addButton).toHaveText('Add to Cart');
    await expect(alpha.quantity).toHaveText('1');
    await products.expectUrl();
    const response = await clientCart.getCart();
    expect(response.status()).toBe(200);
    expectCart(await response.json(), authenticatedUser.username, []);
  });

  test('removes an existing item by saving quantity zero', async ({ products, catalog, clientCart, authenticatedUser }) => {
    // given
    const setup = await clientCart.addItem({ productId: catalog.alpha.id, quantity: 1 });
    expect(setup.status()).toBe(200);
    await products.goto();
    await products.search(catalog.prefix);
    const alpha = products.card(catalog.alpha.name);
    await expect(alpha.inCart).toHaveText('1 in cart');
    await alpha.decreaseQuantity();
    await expect(alpha.addButton).toHaveText('Remove');

    // when
    await alpha.saveToCart();

    // then
    await products.toast.expectDescription(`${catalog.alpha.name} has been removed from your cart`);
    await expect(alpha.inCart).toBeHidden();
    await expect(alpha.addButton).toHaveText('Add to Cart');
    const response = await clientCart.getCart();
    expect(response.status()).toBe(200);
    expectCart(await response.json(), authenticatedUser.username, []);
  });

  test('enforces zero and stock limits and disables out-of-stock additions', async ({ products, catalog }) => {
    // given
    await products.goto();
    await products.search(catalog.prefix);
    const alpha = products.card(catalog.alpha.name);
    await expect(products.card(catalog.beta.name).addButton).toBeDisabled();

    // when
    await alpha.decreaseQuantity(2);

    // then
    await expect(alpha.quantity).toHaveText('0');
    await expect(alpha.addButton).toBeDisabled();

    // when
    await alpha.increaseQuantity(5);

    // then
    await expect(alpha.quantity).toHaveText('3');
    await expect(alpha.addButton).toBeEnabled();
    await products.expectUrl();
  });

  test('preserves the cart after a failed update and allows a successful retry', async ({ page, products, catalog, clientCart, authenticatedUser }) => {
    // given
    const setup = await clientCart.addItem({ productId: catalog.alpha.id, quantity: 1 });
    expect(setup.status()).toBe(200);
    await products.goto();
    await products.search(catalog.prefix);
    const alpha = products.card(catalog.alpha.name);
    await expect(alpha.inCart).toHaveText('1 in cart');
    await alpha.increaseQuantity();
    await page.route(`${CART_ITEMS_ENDPOINT}/${catalog.alpha.id}`, async route => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Injected update failure"}' });
    }, { times: 1 });

    // when
    await alpha.saveToCart();

    // then
    await products.toast.expectDescription('Failed to update cart. Please try again.');
    await expect(alpha.inCart).toHaveText('1 in cart');
    await expect(alpha.addButton).toBeEnabled();
    const failedCart = await clientCart.getCart();
    expect(failedCart.status()).toBe(200);
    expectCart(await failedCart.json(), authenticatedUser.username, [{ product: catalog.alpha, quantity: 1 }]);

    // when
    await alpha.saveToCart();

    // then
    await expect(alpha.inCart).toHaveText('2 in cart');
    await expect(alpha.quantity).toHaveText('2');
    const recoveredCart = await clientCart.getCart();
    expect(recoveredCart.status()).toBe(200);
    expectCart(await recoveredCart.json(), authenticatedUser.username, [{ product: catalog.alpha, quantity: 2 }]);
  });
});
