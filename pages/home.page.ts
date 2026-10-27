import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  protected readonly path = '/';
  readonly root: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByTestId('home-page');
  }
}
