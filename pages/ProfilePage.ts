import { expect, type Locator, type Page } from '@playwright/test';
import { ToastAlert } from '../components/ToastAlert';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  readonly toast: ToastAlert;
  readonly profilePage: Locator;
  readonly title: Locator;
  readonly userSection: Locator;
  readonly userTitle: Locator;
  readonly editForm: Locator;
  readonly emailInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly submitButton: Locator;
  readonly promptSection: Locator;
  readonly promptInput: Locator;
  readonly promptSubmitButton: Locator;
  readonly toolPromptInput: Locator;
  readonly toolPromptSubmitButton: Locator;
  readonly ordersSection: Locator;
  readonly ordersList: Locator;
  readonly orderStatusFilter: Locator;
  readonly emptyOrdersMessage: Locator;
  readonly invalidEmailAlert: Locator;
  readonly firstNameRequiredAlert: Locator;
  readonly lastNameRequiredAlert: Locator;

  constructor(page: Page) {
    super(page, '/profile');
    this.toast = new ToastAlert(page);
    this.profilePage = this.byTestId('profile-page');
    this.title = this.byTestId('profile-title');
    this.userSection = this.byTestId('profile-user-section');
    this.userTitle = this.byTestId('profile-user-title');
    this.editForm = this.byTestId('user-edit-form');
    this.emailInput = this.byTestId('user-edit-email-input');
    this.firstNameInput = this.byTestId('user-edit-firstName-input');
    this.lastNameInput = this.byTestId('user-edit-lastName-input');
    this.submitButton = this.byTestId('user-edit-submit');
    this.promptSection = this.byTestId('profile-prompt-section');
    this.promptInput = this.byTestId('profile-prompt-input');
    this.promptSubmitButton = this.byTestId('profile-prompt-submit');
    this.toolPromptInput = this.byTestId('profile-tool-prompt-input');
    this.toolPromptSubmitButton = this.byTestId('profile-tool-prompt-submit');
    this.ordersSection = this.byTestId('profile-orders-section');
    this.ordersList = this.byTestId('order-list-items');
    this.orderStatusFilter = this.byTestId('order-list-status-filter');
    this.emptyOrdersMessage = this.byTestId('order-list-empty');
    this.invalidEmailAlert = page.getByRole('alert').filter({ hasText: 'Invalid email format' });
    this.firstNameRequiredAlert = page.getByRole('alert').filter({ hasText: 'First name is required' });
    this.lastNameRequiredAlert = page.getByRole('alert').filter({ hasText: 'Last name is required' });
  }

  async verifyLoaded(user: { email: string; firstName: string; lastName: string }) {
    await this.verifyUrl();
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

  async updateProfile(user: { email: string; firstName: string; lastName: string }) {
    await this.emailInput.fill(user.email);
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.submitButton.click();
  }

  async verifyProfileUpdateSucceeded() {
    await expect(this.toast.title).toHaveText('Success');
  }

  async updateChatPrompt(prompt: string) {
    await this.promptInput.fill(prompt);
    await this.promptSubmitButton.click();
  }

  async updateToolPrompt(prompt: string) {
    await this.toolPromptInput.fill(prompt);
    await this.toolPromptSubmitButton.click();
  }

  async verifyChatPromptUpdateSucceeded() {
    await expect(this.toast.viewport).toContainText('Success');
    await expect(this.toast.viewport).toContainText('Chat system prompt updated successfully');
  }

  async verifyToolPromptUpdateSucceeded() {
    await expect(this.toast.viewport).toContainText('Success');
    await expect(this.toast.viewport).toContainText('Tool system prompt updated successfully');
  }

  async verifyPromptsPersisted(prompts: { chatPrompt: string; toolPrompt: string }) {
    await expect(this.promptInput).toHaveValue(prompts.chatPrompt);
    await expect(this.toolPromptInput).toHaveValue(prompts.toolPrompt);
  }

  async verifyOrderVisible(order: { id: number; total: number; itemsCount: number; status?: string }) {
    await expect(this.ordersSection).toBeVisible();
    await expect(this.byTestId(`order-item-${order.id}`)).toBeVisible();
    await expect(this.byTestId(`order-id-${order.id}`)).toHaveText(`Order #${order.id}`);
    await expect(this.byTestId(`order-status-${order.id}`)).toHaveText(order.status ?? 'PENDING');
    await expect(this.byTestId(`order-total-${order.id}`)).toHaveText(`Total: ${this.formatPrice(order.total)}`);
    await expect(this.byTestId(`order-items-count-${order.id}`)).toHaveText(`${order.itemsCount} items`);
    await expect(this.byTestId(`order-details-link-${order.id}`)).toBeVisible();
  }

  async filterOrdersByStatus(status: string) {
    await this.orderStatusFilter.selectOption(status);
  }

  async openOrderDetails(orderId: number) {
    await this.byTestId(`order-details-link-${orderId}`).click();
  }

  async verifyValidationErrors() {
    await expect(this.invalidEmailAlert).toHaveText('Invalid email format');
    await expect(this.firstNameRequiredAlert).toHaveText('First name is required');
    await expect(this.lastNameRequiredAlert).toHaveText('Last name is required');
  }

  private formatPrice(price: number) {
    return `$${price.toFixed(2)}`;
  }
}
