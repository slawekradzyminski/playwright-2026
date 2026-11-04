import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoggedInHeader } from './components/LoggedInHeader';

export class HomePage extends BasePage {
  protected readonly path = '/';
  readonly header: LoggedInHeader;
  readonly welcomeTitle: Locator;
  readonly userEmail: Locator;
  readonly productsButton: Locator;
  readonly usersButton: Locator;
  readonly profileButton: Locator;
  readonly featuresTitle: Locator;
  readonly aiTitle: Locator;
  readonly monitoringTitle: Locator;
  readonly utilitiesTitle: Locator;
  readonly llmButton: Locator;
  readonly trafficButton: Locator;
  readonly qrButton: Locator;
  readonly emailButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new LoggedInHeader(page);
    this.welcomeTitle = page.getByTestId('home-welcome-title');
    this.userEmail = page.getByTestId('home-user-email');
    this.productsButton = page.getByTestId('home-products-button');
    this.usersButton = page.getByTestId('home-users-button');
    this.profileButton = page.getByTestId('home-profile-button');
    this.featuresTitle = page.getByTestId('home-features-title');
    this.aiTitle = page.getByTestId('home-ai-title');
    this.monitoringTitle = page.getByTestId('home-monitoring-title');
    this.utilitiesTitle = page.getByTestId('home-utilities-title');
    this.llmButton = page.getByTestId('home-llm-button');
    this.trafficButton = page.getByTestId('home-traffic-button');
    this.qrButton = page.getByTestId('home-qr-button');
    this.emailButton = page.getByTestId('home-email-button');
  }

  override async expectToBeOpen() {
    await super.expectToBeOpen();
    await expect(this.welcomeTitle).toHaveText(/^Welcome, .+!$/);
    await expect(this.header.logoutButton).toBeVisible();
  }
}
