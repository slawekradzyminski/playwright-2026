import { test, expect } from '../../../fixtures/ui/ordersUi.fixture';
import { OrderDetailsPage } from '../../../pages/OrderDetailsPage';

test.describe('Admin order details', () => {
  test.use({ orderIdentity: 'admin' });
  let details: OrderDetailsPage;

  test.beforeEach(({ page }) => {
    details = new OrderDetailsPage(page);
  });

  test('updates an owner order to PAID only after submitting', async ({ orderSetup, page }) => {
    // given
    const order = await orderSetup.createOrder();
    await details.goto(order.id);
    await details.assertLoaded(order.id);
    await expect(details.adminControls).toBeVisible();
    await expect(details.status).toHaveText('PENDING');

    // when
    await details.statusSelect.selectOption('PAID');

    // then
    await expect(details.status).toHaveText('PENDING');

    // when
    await details.updateStatusButton.click();

    // then
    await expect(details.status).toHaveText('PAID');

    // when
    await page.reload();

    // then
    await expect(details.status).toHaveText('PAID');
    await expect(details.cancelButton).toHaveCount(0);
  });
});
