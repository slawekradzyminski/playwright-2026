import { expect, type Locator, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';

export class ProfilePage {
  readonly page: Page;
  readonly profilePage: Locator;
  readonly title: Locator;
  readonly userSection: Locator;
  readonly userTitle: Locator;
  readonly editForm: Locator;
  readonly emailInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly submitButton: Locator;
  readonly profileUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.profilePage = page.getByTestId('profile-page');
    this.title = page.getByTestId('profile-title');
    this.userSection = page.getByTestId('profile-user-section');
    this.userTitle = page.getByTestId('profile-user-title');
    this.editForm = page.getByTestId('user-edit-form');
    this.emailInput = page.getByTestId('user-edit-email-input');
    this.firstNameInput = page.getByTestId('user-edit-firstName-input');
    this.lastNameInput = page.getByTestId('user-edit-lastName-input');
    this.submitButton = page.getByTestId('user-edit-submit');
    this.profileUrl = `${APP_BASE_URL}/profile`;
  }

  async verifyLoaded(user: { email: string; firstName: string; lastName: string }) {
    await expect(this.page).toHaveURL(this.profileUrl);
    await expect(this.profilePage).toBeVisible();
    await expect(this.title).toHaveText('Profile');
    await expect(this.userSection).toBeVisible();
    await expect(this.userTitle).toHaveText('Personal Information');
    await expect(this.editForm).toBeVisible();
    await expect(this.emailInput).toHaveValue(user.email);
    await expect(this.firstNameInput).toHaveValue(user.firstName);
    await expect(this.lastNameInput).toHaveValue(user.lastName);
    await expect(this.submitButton).toBeVisible();
  }
}
