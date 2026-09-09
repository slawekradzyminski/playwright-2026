import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';
import { Toast } from './components/Toast';

export class HomePage extends LoggedInPage {
  readonly toast: Toast;
  readonly root: Locator;
  readonly welcomeTitle: Locator;
  readonly userEmail: Locator;

  constructor(page: Page) {
    super(page);
    this.toast = new Toast(page);
    this.root = page.getByTestId('home-page');
    this.welcomeTitle = page.getByTestId('home-welcome-title');
    this.userEmail = page.getByTestId('home-user-email');
  }

  async goto() {
    await this.page.goto('/');
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL('/');
    await expect(this.root).toBeVisible();
    await expect(this.welcomeTitle).toBeVisible();
  }

  shortcut(destination: 'products' | 'users' | 'profile' | 'llm' | 'traffic' | 'qr' | 'email'): Locator {
    return this.page.getByTestId(`home-${destination}-button`);
  }
}
