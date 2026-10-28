import { test, expect } from './cart.fixtures';
import { expectCart } from '../../api/cart/cart-test-context';

test.describe('Cart', () => {
  test('shows an empty state and returns to the catalog', async ({ cartPage, page }) => {
    // given
    await cartPage.goto();

    // then
    await expect(cartPage.title).toHaveText('Your Cart');
    await expect(cartPage.emptyState).toContainText('Your cart is empty');
    await expect(cartPage.browseProductsLink).toHaveAttribute('href', '/products');
    await expect(cartPage.checkoutButton).toHaveCount(0);

    // when
    await cartPage.browseProducts();

    // then
    await expect(page.getByTestId('products-title')).toHaveText('Products');
  });

  test('updates a line quantity, total and saved cart through the UI', async ({ cartPage, cartProduct, clientCart, authenticatedUser }) => {
    // given
    const setup = await clientCart.addItem({ productId: cartProduct.id, quantity: 2 });
    expect(setup.status()).toBe(200);
    await cartPage.goto();
    await expect(cartPage.itemName(cartProduct.id)).toHaveText(cartProduct.name);
    await expect(cartPage.itemQuantity(cartProduct.id)).toHaveText('2');
    await expect(cartPage.summaryTotal).toHaveText('$25.00');

    // when
    await cartPage.increaseItem(cartProduct.id);
    await cartPage.updateItem(cartProduct.id);

    // then
    await expect(cartPage.itemQuantity(cartProduct.id)).toHaveText('3');
    await expect(cartPage.summaryItems).toHaveText('3');
    await expect(cartPage.itemTotal(cartProduct.id)).toHaveText('$37.50');
    await expect(cartPage.summaryTotal).toHaveText('$37.50');
    const response = await clientCart.getCart();
    expect(response.status()).toBe(200);
    expectCart(await response.json(), authenticatedUser.username, [{ product: cartProduct, quantity: 3 }]);

    // when
    await cartPage.reload();

    // then
    await expect(cartPage.itemQuantity(cartProduct.id)).toHaveText('3');
    await expect(cartPage.summaryTotal).toHaveText('$37.50');
  });

  test('does not decrement below one unit with keyboard activation', async ({ cartPage, cartProduct, clientCart }) => {
    // given
    const setup = await clientCart.addItem({ productId: cartProduct.id, quantity: 1 });
    expect(setup.status()).toBe(200);
    await cartPage.goto();
    const decrease = cartPage.item(cartProduct.id).getByTestId(`cart-item-decrease-${cartProduct.id}`);
    await expect(cartPage.itemQuantity(cartProduct.id)).toHaveText('1');

    // when
    await decrease.focus();
    await decrease.press('Enter');

    // then
    await expect(cartPage.itemQuantity(cartProduct.id)).toHaveText('1');
    await expect(cartPage.item(cartProduct.id).getByTestId(`cart-item-update-${cartProduct.id}`)).toHaveCount(0);
  });

  test('removes a line and returns to the empty state', async ({ cartPage, cartProduct, clientCart, authenticatedUser }) => {
    // given
    const setup = await clientCart.addItem({ productId: cartProduct.id, quantity: 1 });
    expect(setup.status()).toBe(200);
    await cartPage.goto();
    await expect(cartPage.item(cartProduct.id)).toBeVisible();

    // when
    await cartPage.removeItem(cartProduct.id);

    // then
    await expect(cartPage.emptyState).toContainText('Your cart is empty');
    const response = await clientCart.getCart();
    expect(response.status()).toBe(200);
    expectCart(await response.json(), authenticatedUser.username, []);
  });

  test('clears all cart lines only after confirmation', async ({ cartPage, cartProduct, secondCartProduct, clientCart, authenticatedUser }) => {
    // given
    const setup = await clientCart.addItem({ productId: cartProduct.id, quantity: 2 });
    expect(setup.status()).toBe(200);
    const secondSetup = await clientCart.addItem({ productId: secondCartProduct.id, quantity: 1 });
    expect(secondSetup.status()).toBe(200);
    await cartPage.goto();
    await expect(cartPage.clearButton).toBeEnabled();
    await expect(cartPage.item(cartProduct.id)).toBeVisible();
    await expect(cartPage.item(secondCartProduct.id)).toBeVisible();

    // when
    await cartPage.clearWithConfirmation(false);

    // then
    await expect(cartPage.item(cartProduct.id)).toBeVisible();
    await expect(cartPage.item(secondCartProduct.id)).toBeVisible();
    let response = await clientCart.getCart();
    expect(response.status()).toBe(200);
    expectCart(await response.json(), authenticatedUser.username, [
      { product: cartProduct, quantity: 2 },
      { product: secondCartProduct, quantity: 1 },
    ]);

    // when
    await cartPage.clearWithConfirmation(true);

    // then
    await expect(cartPage.emptyState).toContainText('Your cart is empty');
    response = await clientCart.getCart();
    expect(response.status()).toBe(200);
    expectCart(await response.json(), authenticatedUser.username, []);
    await expect(cartPage.item(cartProduct.id)).toHaveCount(0);
    await expect(cartPage.item(secondCartProduct.id)).toHaveCount(0);
  });
});
