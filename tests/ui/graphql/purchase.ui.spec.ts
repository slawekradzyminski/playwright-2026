import { test, expect, shippingAddress } from './graphql.fixtures';
import { failOperation, holdOperation, loseResponse, waitForOperation } from './graphql-network';

test.describe('GraphQL purchase', () => {
  test('places an order from the cart and shows its details', async ({ page, shop, cartPage, checkout, orderDetails, commerceTraffic }) => {
    // given
    const lamp = await shop.createProduct({ price: 12.5, stockQuantity: 8 });
    await shop.addToCart(lamp, 2);
    await cartPage.goto();
    await cartPage.checkoutButton.click();
    await expect(checkout.total).toHaveText('$25.00');
    await checkout.fillAddress(shippingAddress);

    // when
    const placed = waitForOperation(page, 'Checkout');
    await checkout.placeOrder();

    // then
    const orderId: string = (await (await placed).json()).data.checkout.id;
    await expect(page).toHaveURL(`/orders/${orderId}`);
    await expect(orderDetails.status).toHaveText('PENDING');
    await expect(orderDetails.total).toHaveText('$25.00');
    await expect(orderDetails.items).toContainText(lamp.name);
    await orderDetails.expectShippingAddress(shippingAddress);
    await shop.expectSavedOrder(orderId, { status: 'PENDING', totalAmount: 25, shippingAddress });
    await shop.expectSavedCart([]);
    await shop.expectStock(lamp, 6);
    expect(commerceTraffic.restCommerceRequests).toEqual([]);
  });

  test('submits a held checkout only once and blocks switching the Shop API meanwhile', async ({ page, shop, checkout, orderDetails, shopApi }) => {
    // given
    const product = await shop.createProduct({ stockQuantity: 5 });
    await shop.addToCart(product, 1);
    await checkout.openWithAddress(shippingAddress);
    const release = await holdOperation(page, 'Checkout');

    // when
    await checkout.placeOrder();

    // then
    await expect(checkout.submitButton).toBeDisabled();
    await expect(checkout.submitButton).toHaveText('Processing...');
    await expect(shopApi.select).toBeDisabled();

    // when
    release();

    // then
    await expect(orderDetails.status).toHaveText('PENDING');
    await expect(shopApi.select).toBeEnabled();
    await shop.expectOrderCount(1);
    await shop.expectStock(product, 4);
  });

  test('does not resend a checkout whose response was lost', async ({ page, shop, checkout, commerceTraffic }) => {
    // given
    const product = await shop.createProduct({ stockQuantity: 5 });
    await shop.addToCart(product, 2);
    await checkout.openWithAddress(shippingAddress);
    await loseResponse(page, 'Checkout');
    const alert = page.waitForEvent('dialog');

    // when
    await checkout.placeOrder();

    // then
    const dialog = await alert;
    expect(dialog.message()).toBe('Failed to create order. Please try again.');
    await dialog.accept();
    await expect(checkout.submitButton).toBeEnabled();
    expect(commerceTraffic.operations.filter(operation => operation === 'Checkout')).toHaveLength(1);
    await shop.expectOrderCount(1);
    await shop.expectStock(product, 3);
  });

  test('keeps the cart when another customer bought the remaining stock first', async ({ page, shop, checkout }) => {
    // given
    const product = await shop.createProduct({ stockQuantity: 3 });
    await shop.addToCart(product, 2);
    await checkout.openWithAddress(shippingAddress);
    await shop.placeOrder(product, 2, await shop.createCustomer());

    // when
    await checkout.placeOrder();

    // then
    await expect(checkout.availabilityError).toHaveText(
      'Some items are no longer available in the requested quantity. Your cart was preserved; review it before trying again.',
    );
    await expect(page).toHaveURL('/checkout');
    await shop.expectSavedCart([{ product, quantity: 2 }]);
    await shop.expectOrderCount(0);
    await shop.expectStock(product, 1);
  });

  test('cancels a pending order and restores the stock', async ({ page, shop, orderDetails }) => {
    // given
    const product = await shop.createProduct({ stockQuantity: 8 });
    const order = await shop.placeOrder(product, 3);
    await orderDetails.goto(order.id);
    await expect(orderDetails.status).toHaveText('PENDING');

    // when
    const cancelled = waitForOperation(page, 'CancelOrder');
    await orderDetails.cancelWithConfirmation();

    // then
    expect((await cancelled).ok()).toBe(true);
    await orderDetails.toast.expectSuccess(`Order #${order.id} has been cancelled successfully.`);
    await expect(orderDetails.status).toHaveText('CANCELLED');
    await expect(orderDetails.cancelButton).toHaveCount(0);
    await shop.expectSavedOrder(order.id, { status: 'CANCELLED' });
    await shop.expectStock(product, 8);
  });

  test('blocks switching the Shop API while a cancellation is pending', async ({ page, shop, orderDetails, shopApi }) => {
    // given
    const product = await shop.createProduct({ stockQuantity: 4 });
    const order = await shop.placeOrder(product, 1);
    await orderDetails.goto(order.id);
    await expect(orderDetails.status).toHaveText('PENDING');
    const release = await holdOperation(page, 'CancelOrder');

    // when
    await orderDetails.cancelWithConfirmation();

    // then
    await expect(orderDetails.cancelButton).toHaveText('Cancelling...');
    await expect(orderDetails.cancelButton).toBeDisabled();
    await expect(shopApi.select).toBeDisabled();

    // when
    release();

    // then
    await expect(orderDetails.status).toHaveText('CANCELLED');
    await expect(shopApi.select).toBeEnabled();
    await shop.expectStock(product, 4);
  });

  test('lists only the customer own orders in the profile history', async ({ page, shop, profile, orderDetails }) => {
    // given
    const product = await shop.createProduct({ price: 20 });
    const own = await shop.placeOrder(product, 2);
    const foreign = await shop.placeOrder(product, 1, await shop.createCustomer());

    // when
    const orders = waitForOperation(page, 'Orders');
    await profile.goto();

    // then
    expect((await orders).request().postDataJSON().variables.username).toBe(shop.signedIn.username);
    await expect(profile.orderEntries).toHaveText([`Order #${own.id}`]);
    await expect(profile.orderStatus(own.id)).toHaveText('PENDING');
    await expect(profile.orderTotal(own.id)).toHaveText('Total: $40.00');
    await expect(profile.order(foreign.id)).toHaveCount(0);

    // when
    await profile.openOrder(own.id);

    // then
    await expect(orderDetails.title).toHaveText(`Order #${own.id}`);
  });

  test('shows an order history error without signing out when GraphQL denies access', async ({ page, profile, header, commerceTraffic }) => {
    // given
    await failOperation(page, 'Orders', { field: 'orders', code: 'FORBIDDEN', message: 'Access denied' });

    // when
    await profile.goto();

    // then (the order list retries the read before it reports the error)
    await expect(profile.ordersError).toHaveText('Error loading orders', { timeout: 20_000 });
    await expect(header.logoutButton).toBeVisible();
    await expect(page).toHaveURL('/profile');
    expect(commerceTraffic.tokenRefreshes).toBe(0);
    expect(commerceTraffic.restCommerceRequests).toEqual([]);
  });
});
