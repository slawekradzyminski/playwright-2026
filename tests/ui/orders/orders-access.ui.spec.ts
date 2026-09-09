import { test, expect, missingOrderId } from '../../../fixtures/ui/ordersUi.fixture';
import { OrderDetailsPage } from '../../../pages/OrderDetailsPage';

test.describe('Customer order access', () => {
  test.use({ orderIdentity: 'other' });
  let details: OrderDetailsPage;

  test.beforeEach(({ page }) => {
    details = new OrderDetailsPage(page);
  });

  test('does not expose another customer order or its sensitive details', async ({ orderSetup, page }) => {
    // given
    const order = await orderSetup.createOrder();

    // when
    const responsePromise = page.waitForResponse(response => response.url().endsWith(`/api/v1/orders/${order.id}`));
    await details.goto(order.id);
    const response = await responsePromise;

    // then
    expect(response.status()).toBe(404);
    await details.assertNotFound();
    await details.assertSensitiveDetailsHidden([
      orderSetup.products[0].name, orderSetup.owner.user.username,
      'Test Street', 'Warsaw', '00-001'
    ]);
  });

  test('shows the missing order state', async ({ page }) => {
    // given
    const absentId = missingOrderId;

    // when
    const responsePromise = page.waitForResponse(response => response.url().endsWith(`/api/v1/orders/${absentId}`));
    await details.goto(absentId);
    const response = await responsePromise;

    // then
    expect(response.status()).toBe(404);
    await details.assertNotFound();
  });
});
