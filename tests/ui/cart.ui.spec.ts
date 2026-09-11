import { test } from '../../fixtures/ui/commerce';

test('updates a line, recomputes multi-product totals and removes items to empty', async ({ cartPage, seededCart, otherCartProduct, account }) => {
  // given
  const other = otherCartProduct;
  await cartPage.open();
  await cartPage.expectSummary(3, 30);

  // when
  await cartPage.increaseQuantity(seededCart.id);
  await cartPage.updateQuantity(seededCart.id);

  // then
  await cartPage.expectItem(seededCart, 3);
  await cartPage.expectSummary(4, 42.5);
  await cartPage.header.expectCartCount(4);
  await cartPage.expectPersistedItems(account.token, [{ productId: seededCart.id, quantity: 3 }, { productId: other.id, quantity: 1 }]);
  await cartPage.reload();
  await cartPage.expectSummary(4, 42.5);

  // when
  await cartPage.removeItem(seededCart.id);

  // then
  await cartPage.expectItem(other, 1);
  await cartPage.expectSummary(1, 5);
  await cartPage.header.expectCartCount(1);
  await cartPage.expectPersistedItems(account.token, [{ productId: other.id, quantity: 1 }]);

  // when
  await cartPage.removeItem(other.id);

  // then
  await cartPage.expectEmpty();
  await cartPage.header.expectCartCount(0);
  await cartPage.expectPersistedItems(account.token, []);
});

test('clears the cart only after confirmation', async ({ cartPage, seededCart, account }) => {
  // given
  await cartPage.open();
  await cartPage.expectItem(seededCart, 2);

  // when
  await cartPage.clear(false);

  // then
  await cartPage.expectSummary(2, 25);
  await cartPage.expectPersistedItems(account.token, [{ productId: seededCart.id, quantity: 2 }]);

  // when
  await cartPage.clear(true);

  // then
  await cartPage.expectEmpty();
  await cartPage.header.expectCartCount(0);
  await cartPage.expectPersistedItems(account.token, []);
});

test('continues to checkout with the saved cart', async ({ cartPage, checkoutPage, seededCart }) => {
  // given
  await cartPage.open();
  await cartPage.expectItem(seededCart, 2);

  // when
  await cartPage.checkout();

  // then
  await checkoutPage.expectUrl();
  await checkoutPage.expectSummary(seededCart, 2);
});
