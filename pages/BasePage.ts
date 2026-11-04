import { expect, type Page } from '@playwright/test';
import { Toast } from './components/Toast';

export abstract class BasePage {
  /** Path relative to baseURL, e.g. '/login'. */
  protected abstract readonly path: string;
  readonly toast: Toast;

  constructor(readonly page: Page) {
    this.toast = new Toast(page);
  }

  async goto() {
    await this.page.goto(this.path);
    await this.expectToBeOpen();
  }

  async expectUrl() {
    const escaped = this.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(this.page).toHaveURL(new RegExp(`^[^?#]*${escaped}([?#].*)?$`));
  }

  /** Checks the URL plus page-specific elements; override to add more. */
  async expectToBeOpen() {
    await this.expectUrl();
  }
}
