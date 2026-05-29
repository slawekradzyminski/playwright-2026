import { expect, type Locator, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';

export class EmailPage {
  readonly page: Page;
  readonly emailPage: Locator;
  readonly title: Locator;
  readonly form: Locator;
  readonly toInput: Locator;
  readonly subjectInput: Locator;
  readonly messageInput: Locator;
  readonly submitButton: Locator;
  readonly emailUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.emailPage = page.getByTestId('email-page');
    this.title = page.getByTestId('email-page-title');
    this.form = page.getByTestId('email-form');
    this.toInput = page.getByTestId('email-to-input');
    this.subjectInput = page.getByTestId('email-subject-input');
    this.messageInput = page.getByTestId('email-message-input');
    this.submitButton = page.getByTestId('email-submit-button');
    this.emailUrl = `${APP_BASE_URL}/email`;
  }

  async verifyLoaded() {
    await expect(this.page).toHaveURL(this.emailUrl);
    await expect(this.emailPage).toBeVisible();
    await expect(this.title).toHaveText('Send Email');
    await expect(this.form).toBeVisible();
    await expect(this.toInput).toBeVisible();
    await expect(this.subjectInput).toBeVisible();
    await expect(this.messageInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }
}
