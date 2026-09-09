import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInPage } from './LoggedInPage';
import { Toast } from './components/Toast';

export class ProfilePage extends LoggedInPage {
  readonly toast: Toast;
  readonly root: Locator;
  readonly title: Locator;
  readonly emailInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly saveButton: Locator;
  readonly emailError: Locator;
  readonly chatPromptInput: Locator;
  readonly chatPromptSave: Locator;
  readonly toolPromptInput: Locator;
  readonly toolPromptSave: Locator;

  constructor(page: Page) {
    super(page);
    this.toast = new Toast(page);
    this.root = page.getByTestId('profile-page');
    this.title = this.root.getByTestId('profile-title');
    this.emailInput = this.root.getByTestId('user-edit-email-input');
    this.firstNameInput = this.root.getByTestId('user-edit-firstName-input');
    this.lastNameInput = this.root.getByTestId('user-edit-lastName-input');
    this.saveButton = this.root.getByTestId('user-edit-submit');
    this.emailError = this.root.getByTestId('user-edit-email-error');
    this.chatPromptInput = this.root.getByTestId('profile-prompt-input');
    this.chatPromptSave = this.root.getByTestId('profile-prompt-submit');
    this.toolPromptInput = this.root.getByTestId('profile-tool-prompt-input');
    this.toolPromptSave = this.root.getByTestId('profile-tool-prompt-submit');
  }

  async goto() {
    await this.page.goto('/profile');
    await this.assertLoaded();
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL('/profile');
    await expect(this.root).toBeVisible();
    await expect(this.title).toHaveText('Profile');
    await expect(this.title).toBeVisible();
  }
}
