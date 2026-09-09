import { test, expect } from '../../../fixtures/ui/inventoryUi.fixture';
import { InventoryPage } from '../../../pages/InventoryPage';
import { InventoryClient } from '../../../http/inventoryClient';

test.describe('Inventory workflows', () => {
  let inventory: InventoryPage;

  test.beforeEach(({ page }) => {
    inventory = new InventoryPage(page);
  });

  test('combines search, category, status and threshold filters and recovers from no matches', async ({ inventoryCatalog }) => {
    // given
    await inventory.goto();

    // when
    await inventory.search.fill(inventoryCatalog.key);

    // then
    await expect(inventory.resultCount).toHaveText('3 products');
    for (const product of [inventoryCatalog.empty, inventoryCatalog.low, inventoryCatalog.available]) {
      await expect(inventory.row(product.id)).toContainText(product.name);
    }

    // when
    await inventory.category.fill(inventoryCatalog.category);
    await inventory.status.selectOption('OUT_OF_STOCK');

    // then
    await expect(inventory.resultCount).toHaveText('1 products');
    await expect(inventory.row(inventoryCatalog.empty.id)).toContainText('Out of stock');
    await expect(inventory.row(inventoryCatalog.low.id)).toHaveCount(0);

    // when
    await inventory.status.selectOption('LOW_STOCK');

    // then
    await expect(inventory.row(inventoryCatalog.low.id)).toContainText('Low stock');
    await expect(inventory.row(inventoryCatalog.empty.id)).toHaveCount(0);

    // when
    await inventory.category.fill(inventoryCatalog.otherCategory);

    // then
    await expect(inventory.empty).toBeVisible();
    await expect(inventory.resultCount).toHaveText('0 products');

    // when
    await inventory.threshold.fill('9');

    // then
    await expect(inventory.resultCount).toHaveText('1 products');
    await expect(inventory.row(inventoryCatalog.available.id)).toContainText('Low stock');

    // when
    await inventory.status.selectOption('');
    await inventory.category.fill('');

    // then
    await expect(inventory.resultCount).toHaveText('3 products');
  });

  for (const { delta, expected } of [{ delta: '+3', expected: 5 }, { delta: '-1', expected: 1 }]) {
    test(`persists a ${delta} stock adjustment and its movement`, async ({ inventoryCatalog, page, request, loggedInAdmin }) => {
      // given
      const product = inventoryCatalog.low;
      const reason = `${inventoryCatalog.key} adjustment ${delta}`;
      await inventory.goto();
      await inventory.search.fill(product.name);
      await expect(inventory.resultCount).toHaveText('1 products');

      // when
      await inventory.row(product.id).click();

      // then
      await expect(page).toHaveURL(`/admin/inventory/${product.id}`);
      await expect(inventory.selectedName).toHaveText(product.name);
      await expect(inventory.quantity).toHaveText('2');

      // when
      await inventory.adjust(delta, reason);

      // then
      await inventory.assertRecordedAdjustment({ quantity: expected, reason, delta });

      // when
      await page.reload();
      await inventory.refresh.click();

      // then
      await expect(inventory.quantity).toHaveText(String(expected));
      await expect(inventory.movement(reason)).toHaveCount(1);
      const response = await new InventoryClient(request).movements(product.id, '', loggedInAdmin.token);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.content.filter((movement: { reason: string }) => movement.reason === reason)).toEqual([
        expect.objectContaining({ delta: Number(delta), quantityAfter: expected, type: 'ADMIN_ADJUSTMENT' })
      ]);
    });
  }

  test('keeps invalid adjustments disabled without submitting them', async ({ inventoryCatalog, page }) => {
    // given
    await inventory.goto(inventoryCatalog.low.id);
    await expect(inventory.quantity).toHaveText('2');
    const submissions: string[] = [];
    page.on('request', request => {
      if (request.method() === 'POST' && request.url().endsWith('/adjustments')) submissions.push(request.url());
    });

    // when
    await inventory.delta.fill('1');
    await inventory.reason.fill('   ');

    // then
    await expect(inventory.apply).toBeDisabled();

    for (const delta of ['0', 'abc', '1.5']) {
      // when
      await inventory.delta.fill(delta);
      await inventory.reason.fill('Invalid delta');

      // then
      await expect(inventory.apply).toBeDisabled();
    }
    expect(submissions).toEqual([]);
    await expect(inventory.quantity).toHaveText('2');
  });

  test('preserves stock after a rejected reduction and allows correction', async ({ inventoryCatalog, page }) => {
    // given
    const reason = `${inventoryCatalog.key} corrected receipt`;
    await inventory.goto(inventoryCatalog.low.id);
    await expect(inventory.quantity).toHaveText('2');

    // when
    const conflict = page.waitForResponse(response => response.url().endsWith('/adjustments') && response.request().method() === 'POST');
    await inventory.adjust('-999', 'Rejected stock reduction');

    // then
    expect((await conflict).status()).toBe(409);
    await expect(inventory.adjustmentError).toContainText('conflicts with the current inventory state');
    await expect(inventory.quantity).toHaveText('2');
    await expect(inventory.movement('Rejected stock reduction')).toHaveCount(0);

    // when
    await inventory.adjust('+1', reason);

    // then
    await expect(inventory.quantity).toHaveText('3');
    await expect(inventory.movement(reason)).toHaveCount(1);
    await expect(inventory.adjustmentError).toHaveCount(0);
  });
});
