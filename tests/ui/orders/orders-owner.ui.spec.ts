import { test, expect, shippingAddress } from '../../../fixtures/ui/ordersUi.fixture';
import { ProfilePage } from '../../../pages/ProfilePage';
import { OrderDetailsPage } from '../../../pages/OrderDetailsPage';
import { OrderClient } from '../../../http/orderClient';

test.describe('Customer orders', () => {
  let profile: ProfilePage;
  let details: OrderDetailsPage;

  test.beforeEach(({ page }) => {
    profile = new ProfilePage(page);
    details = new OrderDetailsPage(page);
  });

  test('shows owned order details and persists customer cancellation', async ({ orderSetup, page }) => {
    // given
    const order = await orderSetup.createOrder();
    await profile.goto();
    await expect(profile.orderLink(order.id)).toBeVisible();

    // when
    await profile.openOrder(order.id);

    // then
    await details.assertLoaded(order.id);
    await details.assertContents(order, {
      items: [
        { product: orderSetup.products[0], quantity: 2, total: 24.68 },
        { product: orderSetup.products[1], quantity: 3, total: 17.01 }
      ],
      total: 41.69,
      address: shippingAddress
    });
    await expect(details.status).toHaveText('PENDING');

    // when
    await details.requestCancellation('dismiss');

    // then
    await expect(details.status).toHaveText('PENDING');

    // when
    await details.requestCancellation('accept');

    // then
    await expect(details.status).toHaveText('CANCELLED');

    // when
    await page.reload();

    // then
    await expect(details.status).toHaveText('CANCELLED');
    await expect(details.cancelButton).toHaveCount(0);

    // when
    await profile.goto();

    // then
    await expect(profile.orderStatus(order.id)).toHaveText('CANCELLED');
  });

  test('filters customer orders by status and restores all results', async ({ orderSetup, request, adminToken }) => {
    // given
    const cancelled = await orderSetup.createOrder();
    const paid = await orderSetup.createOrder();
    const pending = await orderSetup.createOrder();
    const cancelledResponse = await new OrderClient(request).cancel(cancelled.id, orderSetup.owner.token);
    expect(cancelledResponse.status()).toBe(200);
    const paidResponse = await new OrderClient(request).updateStatus(paid.id, 'PAID', adminToken);
    expect(paidResponse.status()).toBe(200);
    await profile.goto();

    // when
    await profile.orderStatusFilter.selectOption('CANCELLED');

    // then
    await expect(profile.orderStatus(cancelled.id)).toHaveText('CANCELLED');
    await expect(profile.orderStatus(paid.id)).toHaveCount(0);
    await expect(profile.orderStatus(pending.id)).toHaveCount(0);
    await expect(profile.orderStatus(cancelled.id)).toBeVisible();

    // when
    await profile.orderStatusFilter.selectOption('SHIPPED');

    // then
    await expect(profile.orderEmpty).toBeVisible();
    await expect(profile.orderEmpty).toContainText('SHIPPED');

    // when
    await profile.orderStatusFilter.selectOption('ALL');

    // then
    await expect(profile.orderLink(cancelled.id)).toBeVisible();
    await expect(profile.orderLink(paid.id)).toBeVisible();
    await expect(profile.orderLink(pending.id)).toBeVisible();

  });
});
