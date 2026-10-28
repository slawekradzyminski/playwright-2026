import { randomUUID } from 'node:crypto';
import { adminCommerceTest as test, expect } from './graphql.fixtures';
import { expectProduct } from '../../api/products/product-assertions';
import { holdOperation, waitForOperation } from './graphql-network';

const CONFLICT_MESSAGE =
  'This adjustment conflicts with the current inventory state. Review the quantity and retry the same adjustment if it is still valid.';

test.describe('GraphQL administration', () => {
  test('publishes a new product from the admin form', async ({ page, shop, productForm, adminProducts }) => {
    // given
    const suffix = randomUUID();
    const product = {
      name: `Admin GraphQL ${suffix}`, description: 'Created from the admin form', price: 19.99,
      stockQuantity: 5, category: `Admin GraphQL ${suffix}`, imageUrl: '',
    };
    await productForm.gotoNew();
    await productForm.fill(product);

    // when
    const created = waitForOperation(page, 'CreateProduct');
    await productForm.save();

    // then
    expect((await created).ok()).toBe(true);
    const saved = await shop.trackProductNamed(product.name);
    expectProduct(saved, product);
    await adminProducts.goto();
    await expect(adminProducts.price(saved.id)).toHaveText('$19.99');
    await expect(adminProducts.stock(saved.id)).toHaveText('5');
  });

  test('changes the price of an existing product', async ({ page, shop, productForm, adminProducts }) => {
    // given
    const product = await shop.createProduct({ price: 19.99 });
    await adminProducts.goto();
    await adminProducts.edit(product.id);
    await expect(productForm.price).toHaveValue('19.99');
    await productForm.price.fill('24.50');

    // when
    const updated = waitForOperation(page, 'UpdateProduct');
    await productForm.save();

    // then
    expect((await updated).ok()).toBe(true);
    expect(await shop.savedProduct(product)).toMatchObject({ name: product.name, price: 24.5 });
    await adminProducts.goto();
    await expect(adminProducts.price(product.id)).toHaveText('$24.50');
  });

  test('deletes a product after confirmation', async ({ page, shop, adminProducts }) => {
    // given
    const product = await shop.createProduct();
    await adminProducts.goto();
    await expect(adminProducts.name(product.id)).toHaveText(product.name);

    // when
    const deleted = waitForOperation(page, 'DeleteProduct');
    await adminProducts.deleteWithConfirmation(product.id);

    // then
    expect(await (await deleted).json()).toEqual({ data: { deleteProduct: true } });
    shop.forgetProduct(product);
    await expect(adminProducts.row(product.id)).toHaveCount(0);
    await shop.expectDeleted(product);
  });

  test('finds a pending customer order and marks it as paid', async ({ page, shop, adminOrders, orderDetails }) => {
    // given
    const customer = await shop.createCustomer();
    const order = await shop.placeOrder(await shop.createProduct({ price: 12.5 }), 2, customer);
    await adminOrders.goto();

    // when
    await adminOrders.filterByStatus('PENDING');
    await adminOrders.showOrder(order.id);

    // then
    await expect(adminOrders.customer(order.id)).toHaveText(customer.username);
    await expect(adminOrders.amount(order.id)).toHaveText('$25.00');
    await expect(adminOrders.status(order.id)).toHaveText('PENDING');

    // when
    await adminOrders.openDetails(order.id);
    const updated = waitForOperation(page, 'UpdateOrderStatus');
    await orderDetails.changeStatus('Paid');

    // then
    expect((await updated).ok()).toBe(true);
    await orderDetails.toast.expectSuccess('Order status has been updated to PAID.');
    await expect(orderDetails.status).toHaveText('PAID');
    await shop.expectSavedOrder(order.id, { status: 'PAID' }, customer);
  });

  test('restocks a product and shows the movement in its history', async ({ page, shop, inventory }) => {
    // given
    const product = await shop.createProduct({ stockQuantity: 8 });
    await inventory.goto();
    await inventory.search.fill(product.name);
    await expect(inventory.available(product.id)).toHaveText('8');
    await inventory.select(product.id);
    await expect(inventory.selectedName).toHaveText(product.name);

    // when
    const adjusted = waitForOperation(page, 'AdjustInventory');
    await inventory.adjust('+3', 'Supplier delivery');

    // then
    expect((await adjusted).ok()).toBe(true);
    await expect(inventory.movement('Supplier delivery')).toBeVisible();
    await expect(inventory.available(product.id)).toHaveText('11');
    await shop.expectStock(product, 11);
  });

  test('blocks switching the Shop API while a stock adjustment is pending', async ({ page, shop, inventory, shopApi }) => {
    // given
    const product = await shop.createProduct({ stockQuantity: 6 });
    await inventory.goto(product.id);
    await expect(inventory.selectedName).toHaveText(product.name);
    const release = await holdOperation(page, 'AdjustInventory');

    // when
    await inventory.adjust('+2', 'Pending delivery');

    // then
    await expect(inventory.applyingButton).toBeDisabled();
    await expect(shopApi.select).toBeDisabled();

    // when
    release();

    // then
    await expect(inventory.movement('Pending delivery')).toBeVisible();
    await expect(shopApi.select).toBeEnabled();
    await shop.expectStock(product, 8);
  });

  test('explains a conflicting adjustment and keeps the stock', async ({ shop, inventory }) => {
    // given
    const product = await shop.createProduct({ stockQuantity: 4 });
    await inventory.goto(product.id);
    await expect(inventory.selectedName).toHaveText(product.name);

    // when
    await inventory.adjust('-5', 'Damaged in storage');

    // then
    await expect(inventory.adjustmentError).toHaveText(CONFLICT_MESSAGE);
    await expect(inventory.movement('Damaged in storage')).toHaveCount(0);
    await shop.expectStock(product, 4);
  });

  test('keeps the administrator profile history limited to the administrator orders', async ({ page, shop, profile, commerceTraffic }) => {
    // given
    const customerOrder = await shop.placeOrder(await shop.createProduct(), 1, await shop.createCustomer());

    // when
    const orders = waitForOperation(page, 'Orders');
    await profile.goto();

    // then
    expect((await orders).request().postDataJSON().variables.username).toBe(shop.signedIn.username);
    await expect(profile.ordersTitle).toHaveText('Your Orders');
    await expect(profile.order(customerOrder.id)).toHaveCount(0);
    expect(commerceTraffic.restCommerceRequests).toEqual([]);
  });
});
