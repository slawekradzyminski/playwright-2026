import { test, shippingAddress } from '../../fixtures/ui/commerce';

test('places an order with the shipping address and empties the cart', async ({ checkoutPage, orderDetailsPage, productDetailsPage, cartPage, seededCart, account }) => {
  // given
  await checkoutPage.open();
  await checkoutPage.expectSummary(seededCart, 2);
  await checkoutPage.fillAddress(shippingAddress);

  // when
  const orderId = await checkoutPage.placeOrder();

  // then
  await orderDetailsPage.expectUrl(orderId);
  await orderDetailsPage.expectOrder(orderId, seededCart, 2, shippingAddress);
  await orderDetailsPage.expectStatus('PENDING');
  await orderDetailsPage.header.expectCartCount(0);
  await orderDetailsPage.expectPersisted(orderId, account.token, { username: account.user.username, status: 'PENDING', totalAmount: 25, shippingAddress });
  await cartPage.expectPersistedItems(account.token, []);
  await productDetailsPage.expectPersistedStock(seededCart.id, account.token, 8);
});

test('requires the shipping address without creating an order', async ({ checkoutPage, cartPage, seededCart, account }) => {
  // given
  await checkoutPage.open();
  await checkoutPage.expectSummary(seededCart, 2);

  // when
  await checkoutPage.submit();

  // then
  await checkoutPage.expectRequiredAddress();
  await checkoutPage.expectUrl();
  await checkoutPage.expectNoOrders(account.token);
  await cartPage.expectPersistedItems(account.token, [{ productId: seededCart.id, quantity: 2 }]);
});

test('returns an empty-cart checkout visit to the cart', async ({ checkoutPage, cartPage }) => {
  // given
  await cartPage.open();
  await cartPage.expectEmpty();

  // when
  await checkoutPage.open();

  // then
  await cartPage.expectUrl();
  await cartPage.expectEmpty();
});

test('preserves the cart and address when stock becomes unavailable', async ({ checkoutPage, cartPage, unavailableCart, account }) => {
  // given
  await checkoutPage.open();
  await checkoutPage.fillAddress(shippingAddress);

  // when
  await checkoutPage.submit();

  // then
  await checkoutPage.expectAvailabilityError('Some items are no longer available in the requested quantity. Your cart was preserved; review it before trying again.');
  await checkoutPage.expectAddress(shippingAddress);
  await checkoutPage.expectNoOrders(account.token);
  await cartPage.expectPersistedItems(account.token, [{ productId: unavailableCart.id, quantity: 2 }]);
});
