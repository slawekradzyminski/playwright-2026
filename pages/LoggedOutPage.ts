import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoggedOutHeader } from './components/LoggedOutHeader';

export abstract class LoggedOutPage extends BasePage {
  readonly header: LoggedOutHeader;

  constructor(page: Page) {
    super(page);
    this.header = new LoggedOutHeader(page);
  }
}
