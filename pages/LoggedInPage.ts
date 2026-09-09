import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoggedInHeader } from './components/LoggedInHeader';

export abstract class LoggedInPage extends BasePage {
  readonly header: LoggedInHeader;

  constructor(page: Page) {
    super(page);
    this.header = new LoggedInHeader(page);
  }
}
