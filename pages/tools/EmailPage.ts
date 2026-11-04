import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class EmailPage extends BasePage {
  protected readonly path = '/email';
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('email-page-title');
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.title).toHaveText('Send Email');
  }
}
