import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class AdminInventoryPage extends BasePage {
  protected readonly path = '/admin/inventory';
  readonly search: Locator;
  readonly inspector: Locator;
  readonly selectedName: Locator;
  readonly quantityChange: Locator;
  readonly reason: Locator;
  readonly applyButton: Locator;
  readonly applyingButton: Locator;
  readonly adjustmentError: Locator;

  constructor(page: Page) {
    super(page);
    this.search = page.getByLabel('Search');
    this.inspector = page.getByTestId('inventory-inspector');
    this.selectedName = this.inspector.getByRole('heading', { level: 2 });
    this.quantityChange = page.getByLabel('Quantity change');
    this.reason = page.getByLabel('Reason');
    this.applyButton = page.getByRole('button', { name: 'Apply adjustment' });
    this.applyingButton = page.getByRole('button', { name: 'Applying…' });
    this.adjustmentError = page.getByTestId('inventory-adjustment-error');
  }

  async goto(productId?: number) { await this.page.goto(productId ? `${this.path}/${productId}` : this.path); }
  row(productId: number) { return this.page.getByTestId(`inventory-row-${productId}`); }
  // Rows are mouse-only; see the inventory keyboard access report.
  async select(productId: number) { await this.row(productId).click(); }
  available(productId: number) { return this.row(productId).getByRole('cell').nth(2); }
  stockStatus(productId: number) { return this.row(productId).getByRole('cell').nth(3); }
  movement(reason: string) { return this.inspector.getByText(new RegExp(`^${reason} · `)); }

  async adjust(change: string, reason: string) {
    await this.quantityChange.fill(change);
    await this.reason.fill(reason);
    await this.applyButton.click();
  }
}
