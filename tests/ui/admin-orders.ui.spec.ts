import { adminTest, test } from '../../fixtures/ui/commerce';

adminTest('filters orders, opens the selected order and saves its new status', async ({ adminOrdersPage, orderDetailsPage, order, adminToken }) => {
  // given
  await adminOrdersPage.open();
  await adminOrdersPage.filter('PENDING');
  await adminOrdersPage.expectOrder(order);

  // when
  await adminOrdersPage.viewOrder(order.id);
  await orderDetailsPage.changeStatus('PAID');

  // then
  await orderDetailsPage.expectStatus('PAID');
  await orderDetailsPage.expectPersisted(order.id, adminToken, { status: 'PAID' });
  await adminOrdersPage.open();
  await adminOrdersPage.filter('PAID');
  await adminOrdersPage.expectOrder({ ...order, status: 'PAID' });

  // when
  await adminOrdersPage.filter('PENDING');

  // then
  await adminOrdersPage.expectOrderAbsent(order.id);
});

test('denies clients access to all-customer order administration', async ({ adminOrdersPage, homePage }) => {
  // given
  await homePage.open();

  // when
  await adminOrdersPage.open();

  // then
  await adminOrdersPage.expectClientDenied();
});
