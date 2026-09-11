import { expect, type Page } from '@playwright/test';
import { UserByUsernameClient } from '../clients/users/user-by-username-client';
import { Toast } from './components/toast';
import type { OrderDto, OrderStatus } from '../types/commerce';
import { BasePage } from './base-page';
import { AuthenticatedHeader } from './components/authenticated-header';

export class ProfilePage extends BasePage {
  readonly header: AuthenticatedHeader;
  readonly toast: Toast;

  constructor(page: Page) {
    super(page, '/profile', 'profile-page');
    this.header = new AuthenticatedHeader(page);
    this.toast = new Toast(page);
  }

  async expectVisible() {
    await expect(this.root).toBeVisible();
  }
  async reload() { await this.page.reload(); }
  async fillPersonalDetails(details: { email: string; firstName: string; lastName: string }) {
    for (const [field, value] of Object.entries(details)) await this.root.getByTestId(`user-edit-${field}-input`).fill(value);
  }
  async savePersonalDetails() { await this.root.getByTestId('user-edit-submit').click(); }
  async expectPersonalDetails(details: { email: string; firstName: string; lastName: string }) {
    for (const [field, value] of Object.entries(details)) await expect(this.root.getByTestId(`user-edit-${field}-input`)).toHaveValue(value);
  }
  async expectPersistedDetails(username: string, token: string, details: { email: string; firstName: string; lastName: string }) {
    await expect.poll(async () => {
      const response = await new UserByUsernameClient(this.page.request).getByUsername(username, token);
      expect(response.status()).toBe(200);
      return response.json();
    }).toMatchObject(details);
  }
  async savePrompts(chat: string, tool: string) {
    await this.root.getByTestId('profile-prompt-input').fill(chat);
    const chatSaved = this.page.waitForResponse(r => r.url().endsWith('/chat-system-prompt') && r.request().method() === 'PUT');
    await this.root.getByTestId('profile-prompt-submit').click();
    await chatSaved;
    await this.root.getByTestId('profile-tool-prompt-input').fill(tool);
    const toolSaved = this.page.waitForResponse(r => r.url().endsWith('/tool-system-prompt') && r.request().method() === 'PUT');
    await this.root.getByTestId('profile-tool-prompt-submit').click();
    await toolSaved;
  }
  async expectPrompts(chat: string, tool: string) {
    await expect(this.root.getByTestId('profile-prompt-input')).toHaveValue(chat);
    await expect(this.root.getByTestId('profile-tool-prompt-input')).toHaveValue(tool);
  }
  async filterOrders(status: OrderStatus | 'ALL') { await this.root.getByTestId('order-list-status-filter').selectOption(status); }
  async expectOrder(order: OrderDto) {
    await expect(this.root.getByTestId(`order-status-${order.id}`)).toHaveText(order.status);
    await expect(this.root.getByTestId(`order-total-${order.id}`)).toHaveText(`Total: $${order.totalAmount.toFixed(2)}`);
  }
  async expectNoOrders() { await expect(this.root.getByTestId('order-list-empty')).toBeVisible(); }
  async viewOrder(id: number) { await this.root.getByTestId(`order-details-link-${id}`).click(); }

}
