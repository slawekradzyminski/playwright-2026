import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class RegisterPage extends BasePage {
  protected readonly path = '/register';
  readonly root: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('register-page');
  }
}
