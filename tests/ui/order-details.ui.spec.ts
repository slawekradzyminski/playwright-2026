import { test, shippingAddress } from '../../fixtures/ui/commerce';

test('shows the own order and cancels it only after confirmation', async ({ orderDetailsPage, productDetailsPage, order, product, account }) => {
  // given
  await orderDetailsPage.open(order.id);
  await orderDetailsPage.expectOrder(order.id, product, 2, shippingAddress);
  await orderDetailsPage.expectStatus('PENDING');
  await orderDetailsPage.expectClientControls();

  // when
  await orderDetailsPage.cancel(false);

  // then
  await orderDetailsPage.expectStatus('PENDING');
  await orderDetailsPage.expectPersisted(order.id, account.token, { status: 'PENDING' });
  await productDetailsPage.expectPersistedStock(product.id, account.token, 8);

  // when
  await orderDetailsPage.cancel(true);

  // then
  await orderDetailsPage.expectStatus('CANCELLED');
  await orderDetailsPage.expectCancellationUnavailable();
  await orderDetailsPage.expectPersisted(order.id, account.token, { status: 'CANCELLED' });
  await productDetailsPage.expectPersistedStock(product.id, account.token, 10);
  await orderDetailsPage.reload();
  await orderDetailsPage.expectStatus('CANCELLED');
});
