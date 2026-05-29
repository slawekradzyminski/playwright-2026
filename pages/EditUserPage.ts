import { expect, type Locator, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';
import { BasePage } from './BasePage';

export class EditUserPage extends BasePage {
  readonly pageRoot: Locator;
  readonly title: Locator;
  readonly usernameSummary: Locator;
  readonly form: Locator;
  readonly emailInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page, username: string) {
    super(page, `/users/${username}/edit`);
    this.pageRoot = this.byTestId('edit-user-page');
    this.title = this.byTestId('edit-user-title');
    this.usernameSummary = this.byTestId('edit-user-username');
    this.form = this.byTestId('edit-user-form');
    this.emailInput = this.byTestId('edit-user-email-input');
    this.firstNameInput = this.byTestId('edit-user-firstname-input');
    this.lastNameInput = this.byTestId('edit-user-lastname-input');
    this.cancelButton = this.byTestId('edit-user-cancel-button');
    this.submitButton = this.byTestId('edit-user-submit-button');
  }

  get accessDeniedUrl(): string {
    return `${APP_BASE_URL}${this.path}`;
  }

  async verifyLoaded(username: string) {
    await this.verifyUrl();
    await expect(this.pageRoot).toBeVisible();
    await expect(this.title).toHaveText('Edit User');
    await expect(this.usernameSummary).toHaveText(`Editing user: ${username}`);
    await expect(this.form).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async verifyAccessDenied() {
    await expect(this.page).toHaveURL(this.accessDeniedUrl);
    await expect(this.page.getByText('Access denied')).toBeVisible();
    await expect(this.pageRoot).toBeHidden();
  }
}
