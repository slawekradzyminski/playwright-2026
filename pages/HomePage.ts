import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Toast } from './components/Toast';

export class HomePage extends BasePage {
  readonly toast: Toast;
  readonly profileLink: Locator;

  constructor(page: Page) {
    super(page);
    this.toast = new Toast(page);
    this.profileLink = page.getByTestId('username-profile-link');
  }
}
