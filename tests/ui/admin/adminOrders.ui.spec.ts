import { test, expect } from '../../../fixtures/ui/ordersUi.fixture';
import { AdminOrdersPage } from '../../../pages/AdminOrdersPage';
import { OrderDetailsPage } from '../../../pages/OrderDetailsPage';
import { OrderClient } from '../../../http/orderClient';

test.describe('Admin order list workflows', () => {
  test.use({ orderIdentity: 'admin' });
  let list: AdminOrdersPage;
  let details: OrderDetailsPage;
  test.beforeEach(({ page }) => {
    list = new AdminOrdersPage(page);
    details = new OrderDetailsPage(page);
  });

  test('filters paid orders and opens the owned order with persisted status', async ({ orderSetup, request, adminToken }) => {
    // given
    const order = await orderSetup.createOrder();
    expect((await new OrderClient(request).updateStatus(order.id, 'PAID', adminToken)).status()).toBe(200);
    await list.goto();

    // when
    await list.status.selectOption('PAID');
    await expect(list.pagination).toContainText('Page 1 of');
    await list.findOrder(order.id);

    // then
    await list.assertOrderSummary(order.id, { customer: order.username, total: 41.69 });
    await list.assertOnlyStatus('PAID');

    // when
    await list.details(order.id).click();

    // then
    await details.assertLoaded(order.id);
    await expect(details.status).toHaveText('PAID');
  });
});
