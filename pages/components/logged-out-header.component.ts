import type { Page } from '@playwright/test';

export class LoggedOutHeader {
  constructor(private readonly page: Page) {}

  async openRegistration(): Promise<void> {
    await this.page.getByTestId('navigation').getByTestId('register-link').click();
  }
}
