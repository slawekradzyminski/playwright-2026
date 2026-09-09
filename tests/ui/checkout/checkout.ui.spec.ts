import { test, expect } from '../../../fixtures/ui/checkoutUi.fixture';
import { CartPage } from '../../../pages/CartPage';
import { CheckoutPage } from '../../../pages/CheckoutPage';
import { OrderDetailsPage } from '../../../pages/OrderDetailsPage';

test.describe('Checkout', () => {
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;
  let orderDetailsPage: OrderDetailsPage;

  test.beforeEach(({ page }) => {
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    orderDetailsPage = new OrderDetailsPage(page);
  });

  test('redirects an empty checkout to the cart', async ({ page }) => {
    // given: the authenticated customer has an empty cart

    // when
    await page.goto('/checkout');

    // then
    await cartPage.assertLoaded();
    await expect(cartPage.empty).toBeVisible();
  });

  test('validates shipping before posting and creates one order that clears the cart', async ({ page, orderSetup }) => {
    // given
    await orderSetup.fillCart();
    await page.goto('/cart');
    await cartPage.checkoutButton.click();
    await checkoutPage.assertLoaded();
    await expect(checkoutPage.total).toHaveText('$41.69');
    await expect(checkoutPage.itemCount).toHaveText('5');
    await expect(checkoutPage.itemTotal(orderSetup.products[0].id)).toHaveText('$24.68');
    await expect(checkoutPage.itemTotal(orderSetup.products[1].id)).toHaveText('$17.01');

    // when
    const requests: string[] = [];
    page.on('request', request => { if (request.url().endsWith('/api/v1/orders') && request.method() === 'POST') requests.push(request.url()); });
    await checkoutPage.submitButton.click();

    // then
    await checkoutPage.assertShippingAddressRequired();
    expect(requests).toHaveLength(0);

    // when
    await checkoutPage.fillShippingAddress({ street: '42 Test Street', city: 'Warsaw', state: 'Mazovia', zipCode: '00-001', country: 'Poland' });
    const created = await checkoutPage.placeOrder();

    // then
    expect(requests).toHaveLength(1);
    await orderDetailsPage.assertLoaded(created.id);
    await expect(orderDetailsPage.status).toHaveText('PENDING');
    await orderDetailsPage.assertContents(created, {
      items: [
        { product: orderSetup.products[0], quantity: 2, total: 24.68 },
        { product: orderSetup.products[1], quantity: 3, total: 17.01 }
      ],
      total: 41.69,
      address: { street: '42 Test Street', city: 'Warsaw', state: 'Mazovia', zipCode: '00-001', country: 'Poland' }
    });

    // when
    await page.goto('/cart');

    // then
    await expect(cartPage.empty).toBeVisible();
  });

  test('keeps the cart after a stock shortage and creates one order after restocking', async ({ page, checkoutStock }) => {
    // given
    const address = { street: '42 Conflict Street', city: 'Warsaw', state: 'Mazovia', zipCode: '00-001', country: 'Poland' };
    await checkoutStock.prepare({ quantity: 2, availableStock: 1 });
    await checkoutPage.goto();
    await checkoutPage.fillShippingAddress(address);

    // when
    const rejectedOrder = await checkoutPage.submitOrder();

    // then
    expect(rejectedOrder.status()).toBe(409);
    await checkoutPage.assertStockConflictPreservesAddress(address);
    await checkoutStock.assertCartQuantity(2);
    await checkoutStock.assertOrderCount(0);

    // when
    await checkoutStock.restock(20);
    const createdOrder = await checkoutPage.placeOrder();

    // then
    await orderDetailsPage.assertLoaded(createdOrder.id);
    await expect(orderDetailsPage.total).toHaveText('$24.68');
    await checkoutStock.assertOrderCount(1);

    // when
    await page.goto('/cart');

    // then
    await expect(cartPage.empty).toBeVisible();
  });
});
