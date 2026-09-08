import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Toast } from './components/Toast';

export class RegisterPage extends BasePage {
  readonly toast: Toast;
  readonly root: Locator;

  constructor(page: Page) {
    super(page);
    this.toast = new Toast(page);
    this.root = page.getByTestId('register-page');
  }
}
