import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';

export class InventoryPage extends LoggedInPage {
  readonly root: Locator;
  readonly search: Locator;
  readonly category: Locator;
  readonly status: Locator;
  readonly threshold: Locator;
  readonly resultCount: Locator;
  readonly empty: Locator;
  readonly inspector: Locator;
  readonly selectedName: Locator;
  readonly quantity: Locator;
  readonly delta: Locator;
  readonly reason: Locator;
  readonly apply: Locator;
  readonly adjustmentError: Locator;
  readonly refresh: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('admin-inventory');
    this.search = this.root.getByLabel('Search', { exact: true });
    this.category = this.root.getByLabel('Category', { exact: true });
    this.status = this.root.getByLabel('Stock status');
    this.threshold = this.root.getByLabel('Low-stock threshold');
    this.resultCount = this.root.getByTestId('inventory-result-count');
    this.empty = this.root.getByText('No inventory matches these filters.', { exact: true });
    this.inspector = this.root.getByTestId('inventory-inspector');
    this.selectedName = this.inspector.getByRole('heading', { level: 2 });
    // The inspector quantity currently has no dedicated test id or accessible role.
    this.quantity = this.inspector.locator('span.text-3xl');
    this.delta = this.inspector.getByLabel('Quantity change');
    this.reason = this.inspector.getByLabel('Reason', { exact: true });
    this.apply = this.inspector.getByRole('button', { name: 'Apply adjustment', exact: true });
    this.adjustmentError = this.inspector.getByTestId('inventory-adjustment-error');
    this.refresh = this.inspector.getByRole('button', { name: 'Refresh', exact: true });
  }

  async goto(productId?: number) {
    await this.page.goto(productId === undefined ? '/admin/inventory' : `/admin/inventory/${productId}`);
    await expect(this.root.getByRole('heading', { name: 'Inventory', exact: true })).toBeVisible();
  }

  row(id: number) { return this.root.getByTestId(`inventory-row-${id}`); }
  movement(reason: string) { return this.inspector.locator('div.border-b').filter({ hasText: reason }); }

  async adjust(delta: string, reason: string) {
    await this.delta.fill(delta);
    await this.reason.fill(reason);
    await this.apply.click();
  }

  async assertRecordedAdjustment(expected: { quantity: number; reason: string; delta: string }) {
    await expect(this.quantity).toHaveText(String(expected.quantity));
    await expect(this.movement(expected.reason)).toHaveCount(1);
    await expect(this.movement(expected.reason)).toContainText('ADMIN ADJUSTMENT');
    await expect(this.movement(expected.reason)).toContainText(expected.delta);
    await expect(this.delta).toHaveValue('');
    await expect(this.reason).toHaveValue('');
  }
}
