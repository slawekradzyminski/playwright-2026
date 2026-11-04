import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class EmailPage extends BasePage {
  protected readonly path = '/email';
  readonly title: Locator;
  readonly recipient: Locator;
  readonly subject: Locator;
  readonly message: Locator;
  readonly submit: Locator;
  readonly recipientError: Locator;
  readonly subjectError: Locator;
  readonly messageError: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('email-page-title');
    this.recipient = page.getByTestId('email-to-input');
    this.subject = page.getByTestId('email-subject-input');
    this.message = page.getByTestId('email-message-input');
    this.submit = page.getByTestId('email-submit-button');
    this.recipientError = page.getByTestId('email-to-error');
    this.subjectError = page.getByTestId('email-subject-error');
    this.messageError = page.getByTestId('email-message-error');
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.title).toHaveText('Send Email');
  }
}
