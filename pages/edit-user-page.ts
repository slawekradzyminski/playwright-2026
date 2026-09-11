import { expect, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../test-config';
import { UserByUsernameClient } from '../clients/users/user-by-username-client';

type Details = { email: string; firstName: string; lastName: string };
export class EditUserPage {
  constructor(private readonly page: Page) {}
  async open(username: string) { await this.page.goto(`${APP_BASE_URL}/users/${encodeURIComponent(username)}/edit`); }
  async fill(details: Details) {
    for (const [field, value] of Object.entries({ email: details.email, firstName: details.firstName, lastName: details.lastName })) await this.page.getByTestId(`edit-user-${field.toLowerCase()}-input`).fill(value);
  }
  async save() { await this.page.getByTestId('edit-user-submit-button').click(); }
  async cancel() { await this.page.getByTestId('edit-user-cancel-button').click(); }
  async expectDenied() {
    await expect(this.page.getByTestId('edit-user-denied')).toHaveText('Access denied');
    await expect(this.page.getByTestId('edit-user-form')).toHaveCount(0);
  }
  async expectValues(details: Details) {
    for (const [field, value] of Object.entries({ email: details.email, firstName: details.firstName, lastName: details.lastName })) await expect(this.page.getByTestId(`edit-user-${field.toLowerCase()}-input`)).toHaveValue(value);
  }
  async expectPersisted(username: string, token: string, details: Details) {
    const response = await new UserByUsernameClient(this.page.request).getByUsername(username, token);
    expect(response.status()).toBe(200);
    const { email, firstName, lastName } = details;
    expect(await response.json()).toMatchObject({ email, firstName, lastName });
  }
}
