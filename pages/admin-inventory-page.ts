import { expect, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../test-config';
import { BasePage } from './base-page';
import { GetInventoryClient } from '../clients/inventory/get-inventory-client';
import { ListInventoryMovementsClient } from '../clients/inventory/list-inventory-movements-client';

export class AdminInventoryPage extends BasePage {
  constructor(page: Page) { super(page, '/admin/inventory', 'admin-inventory'); }
  async openProduct(id: number) { await this.page.goto(`${APP_BASE_URL}/admin/inventory/${id}`); }
  async search(name: string) { await this.root.getByLabel('Search', { exact: true }).fill(name); }
  async selectProduct(id: number) { await this.root.getByTestId(`inventory-row-${id}`).click(); }
  async fillAdjustment(delta: number, reason: string) {
    await this.root.getByLabel('Quantity change').fill(String(delta));
    await this.root.getByLabel('Reason', { exact: true }).fill(reason);
  }
  async applyAdjustment() { await this.root.getByRole('button', { name: 'Apply adjustment' }).click(); }
  async expectSelected(name: string, quantity: number) {
    const inspector = this.root.getByTestId('inventory-inspector');
    await expect(inspector.getByRole('heading', { name, exact: true })).toBeVisible();
    await expect(inspector.getByText(String(quantity), { exact: true })).toBeVisible();
  }
  async expectMovement(reason: string, delta: number) {
    const inspector = this.root.getByTestId('inventory-inspector');
    await expect(inspector.getByText(reason, { exact: false })).toBeVisible();
    await expect(inspector.getByText(delta > 0 ? `+${delta}` : String(delta), { exact: true })).toBeVisible();
  }
  async expectPersisted(id: number, token: string, quantity: number, reason: string, delta: number) {
    const response = await new GetInventoryClient(this.page.request).get(id, token);
    expect(response.status()).toBe(200);
    expect((await response.json()).availableQuantity).toBe(quantity);
    const movements = await new ListInventoryMovementsClient(this.page.request).list(id, token);
    expect(movements.status()).toBe(200);
    expect((await movements.json()).content.filter((m: { reason: string }) => m.reason === reason)).toEqual([
      expect.objectContaining({ reason, delta }),
    ]);
  }
  async expectClientDenied() {
    await expect(this.page).toHaveURL(`${APP_BASE_URL}/`);
    await expect(this.root).toHaveCount(0);
  }

}
