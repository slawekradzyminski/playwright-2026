import { test, expect } from './products.fixtures';
import { ProductDetailsPage } from '../../../pages/product-details.page';
import { expectCart } from '../../api/cart/cart-test-context';
import { CART_ITEMS_ENDPOINT } from '../../../http/cart-client';

test.describe('Product details', () => {
  test('shows product data and adds the selected quantity to the cart', async ({ page, catalog, clientCart, authenticatedUser }) => {
    // given
    const details = new ProductDetailsPage(page);
    await details.goto(catalog.alpha.id);
    await expect(details.title).toHaveText(catalog.alpha.name);
    await expect(details.description).toHaveText(catalog.alpha.description);
    await expect(details.category).toHaveText(catalog.alpha.category);
    await expect(details.price).toHaveText('$9.99');
    await expect(details.stock).toHaveText('3 in stock');
    await details.increase();

    // when
    await details.save();

    // then
    await details.toast.expectSuccess(`2 × ${catalog.alpha.name} added to your cart`);
    await expect(details.inCart).toHaveText('2 in cart');
    const response = await clientCart.getCart();
    expect(response.status()).toBe(200);
    expectCart(await response.json(), authenticatedUser.username, [{ product: catalog.alpha, quantity: 2 }]);
    await page.reload();
    await expect(details.quantity).toHaveText('2');
    await expect(details.saveButton).toHaveText('Update Cart');
  });

  test('updates and removes a cart item', async ({ page, catalog, clientCart, authenticatedUser }) => {
    // given
    const setup = await clientCart.addItem({ productId: catalog.alpha.id, quantity: 2 });
    expect(setup.status()).toBe(200);
    const details = new ProductDetailsPage(page);
    await details.goto(catalog.alpha.id);
    await expect(details.inCart).toHaveText('2 in cart');
    await details.decrease();

    // when
    await details.save();

    // then
    await details.toast.expectSuccess(`${catalog.alpha.name} quantity set to 1`);
    await expect(details.inCart).toHaveText('1 in cart');
    const updated = await clientCart.getCart();
    expect(updated.status()).toBe(200);
    expectCart(await updated.json(), authenticatedUser.username, [{ product: catalog.alpha, quantity: 1 }]);

    // when
    await details.remove();

    // then
    await details.toast.expectSuccess(`${catalog.alpha.name} has been removed from your cart`);
    await expect(details.inCart).toBeHidden();
    await expect(details.saveButton).toHaveText('Add to Cart');
    const removed = await clientCart.getCart();
    expect(removed.status()).toBe(200);
    expectCart(await removed.json(), authenticatedUser.username, []);
  });

  test('limits quantity and prevents adding an unavailable product', async ({ page, catalog }) => {
    // given
    const details = new ProductDetailsPage(page);
    await details.goto(catalog.alpha.id);
    await expect(details.title).toHaveText(catalog.alpha.name);

    // when
    await details.decrease();
    await details.decrease();

    // then
    await expect(details.quantity).toHaveText('0');
    await expect(details.saveButton).toBeDisabled();

    // when
    await details.increase();
    await details.increase();
    await details.increase();
    await details.increase();

    // then
    await expect(details.quantity).toHaveText('3');
    await details.goto(catalog.beta.id);
    await expect(details.stock).toHaveText('Out of stock');
    await expect(details.saveButton).toBeDisabled();
  });

  test('preserves the cart after a failed update and allows retry', async ({ page, catalog, clientCart, authenticatedUser }) => {
    // given
    const setup = await clientCart.addItem({ productId: catalog.alpha.id, quantity: 1 });
    expect(setup.status()).toBe(200);
    const details = new ProductDetailsPage(page);
    await details.goto(catalog.alpha.id);
    await expect(details.inCart).toHaveText('1 in cart');
    await details.increase();
    await page.route(`${CART_ITEMS_ENDPOINT}/${catalog.alpha.id}`, route => route.fulfill({
      status: 500, contentType: 'application/json', body: '{"message":"Injected update failure"}',
    }), { times: 1 });

    // when
    await details.save();

    // then
    await details.toast.expectFailure('Failed to update cart. Please try again.');
    await expect(details.inCart).toHaveText('1 in cart');
    const unchanged = await clientCart.getCart();
    expect(unchanged.status()).toBe(200);
    expectCart(await unchanged.json(), authenticatedUser.username, [{ product: catalog.alpha, quantity: 1 }]);

    // when
    await details.save();

    // then
    await details.toast.expectSuccess(`${catalog.alpha.name} quantity set to 2`);
    await expect(details.inCart).toHaveText('2 in cart');
    const updated = await clientCart.getCart();
    expect(updated.status()).toBe(200);
    expectCart(await updated.json(), authenticatedUser.username, [{ product: catalog.alpha, quantity: 2 }]);
  });

  test('recovers from a missing product through the catalog link', async ({ page }) => {
    // given
    const details = new ProductDetailsPage(page);

    // when
    await details.goto(2147483647);

    // then
    await expect(details.error).toContainText('Error loading product details');
    await details.back();
    await expect(page.getByTestId('products-title')).toHaveText('Products');
  });
});
