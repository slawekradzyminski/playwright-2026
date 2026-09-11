import { expect, type Page } from '@playwright/test';
import { UserByUsernameClient } from '../clients/users/user-by-username-client';
import { BasePage } from './base-page';
import { AuthenticatedHeader } from './components/authenticated-header';

export class UsersPage extends BasePage {
  readonly header: AuthenticatedHeader;

  constructor(page: Page) {
    super(page, '/users', 'users-page');
    this.header = new AuthenticatedHeader(page);
  }

  async expectVisible() {
    await expect(this.root).toBeVisible();
  }
  private user(username: string) {
    return this.root.getByTestId(/^user-item-/).filter({ has: this.page.getByText(`Username: ${username}`, { exact: true }) });
  }
  async expectUser(username: string, details: { email: string; firstName: string; lastName: string }) {
    const user = this.user(username);
    await expect(user.getByTestId(/^user-name-/)).toHaveText(`${details.firstName} ${details.lastName}`);
    await expect(user.getByTestId(/^user-email-/)).toHaveText(details.email);
  }
  async expectClientCannotManage(username: string) {
    await expect(this.user(username)).toBeVisible();
    await expect(this.root.getByTestId(/^user-edit-/)).toHaveCount(0);
    await expect(this.root.getByTestId(/^user-delete-/)).toHaveCount(0);
  }
  async edit(username: string) { await this.user(username).getByTestId(/^user-edit-/).click(); }
  async remove(username: string) {
    this.page.once('dialog', dialog => dialog.accept());
    await this.user(username).getByTestId(/^user-delete-/).click();
  }
  async expectRemoved(username: string, token: string) {
    await expect(this.user(username)).toHaveCount(0);
    expect((await new UserByUsernameClient(this.page.request).getByUsername(username, token)).status()).toBe(404);
  }

}
