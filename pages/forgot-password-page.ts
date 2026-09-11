import { expect, type Page } from '@playwright/test';
import { BasePage } from './base-page';

export class ForgotPasswordPage extends BasePage {
  constructor(page: Page) {
    super(page, '/forgot-password', 'forgot-page');
  }

  async expectTitle() {
    await expect(this.root.getByTestId('forgot-title')).toHaveText('Forgot password');
  }
}
