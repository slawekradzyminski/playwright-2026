import { test, expect } from '../../../fixtures/ui/ordersUi.fixture';
import { CartPage } from '../../../pages/CartPage';

test.describe('Cart', () => {
  let cartPage: CartPage;

  test.beforeEach(({ page }) => {
    cartPage = new CartPage(page);
  });

  test('updates quantities, recomputes totals, persists, removes and clears with confirmation', async ({ page, orderSetup }) => {
    // given
    await orderSetup.fillCart();
    await page.goto('/cart');
    await cartPage.assertLoaded();
    const first = orderSetup.products[0].id;
    const second = orderSetup.products[1].id;

    // when
    await cartPage.increaseQuantity(first);

    // then
    await expect(cartPage.quantity(first)).toHaveText('3');
    await expect(cartPage.lineTotal(first)).toHaveText('$37.02');
    await cartPage.assertSummary({ items: 6, total: 54.03 });

    // when
    await cartPage.decreaseQuantity(first);
    await page.reload();

    // then
    await cartPage.assertLoaded();
    await expect(cartPage.quantity(first)).toHaveText('2');
    await expect(cartPage.total).toHaveText('$41.69');

    // when
    await cartPage.remove(second).click();

    // then
    await expect(cartPage.item(second)).toHaveCount(0);
    await cartPage.assertSummary({ items: 2, total: 24.68 });

    // when
    await cartPage.requestClear('dismiss');

    // then
    await expect(cartPage.itemCount).toHaveText('2');

    // when
    await cartPage.requestClear('accept');

    // then
    await expect(cartPage.empty).toBeVisible();
    await page.reload();
    await expect(cartPage.empty).toBeVisible();
  });

  test('shows a temporary cart error and restores the cart after retry', async ({ page, orderSetup }) => {
    // given
    await orderSetup.fillCart();
    await page.route('**/api/v1/cart', route => route.fulfill({ status: 503, json: { message: 'temporary' } }));

    // when
    await page.goto('/cart');

    // then
    await expect(cartPage.error).toBeVisible();

    // when
    await page.unroute('**/api/v1/cart');
    await cartPage.retry.click();

    // then
    await cartPage.assertSummary({ items: 5, total: 41.69 });
  });
});
