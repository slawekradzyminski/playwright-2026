import { expect, type Locator, type Page } from '@playwright/test';
import { ADMIN_USER } from '../config/constants';
import { BasePage } from './BasePage';

export class UsersPage extends BasePage {
  readonly pageRoot: Locator;
  readonly title: Locator;
  readonly usersList: Locator;
  readonly adminUserRow: Locator;
  readonly adminUserName: Locator;
  readonly adminUserRoles: Locator;
  readonly userRows: Locator;
  readonly editButtons: Locator;
  readonly deleteButtons: Locator;

  constructor(page: Page) {
    super(page, '/users');
    this.pageRoot = this.byTestId('users-page');
    this.title = this.byTestId('users-title');
    this.usersList = this.byTestId('users-list');
    this.adminUserRow = this.byTestId('user-item-1');
    this.adminUserName = this.byTestId('user-name-1');
    this.adminUserRoles = this.byTestId('user-roles-1');
    this.userRows = this.page.locator('[data-testid^="user-item-"]');
    this.editButtons = this.page.locator('[data-testid^="user-edit-"]');
    this.deleteButtons = this.page.locator('[data-testid^="user-delete-"]');
  }

  async verifyLoaded() {
    await this.verifyUrl();
    await expect(this.pageRoot).toBeVisible();
    await expect(this.title).toHaveText('Users');
    await expect(this.usersList).toBeVisible();
    await expect(this.userRows.first()).toBeVisible();
    await expect(this.userRows).not.toHaveCount(0);
  }

  async verifyAdminUserListed(displayName = ADMIN_USER.displayName || 'Slawomir Radzyminski') {
    await expect(this.adminUserRow).toBeVisible();
    await expect(this.adminUserName).toHaveText(displayName);
    await expect(this.adminUserRoles).toContainText('ROLE_ADMIN');
  }

  async verifyMutatingActionsVisible() {
    await expect(this.editButtons.first()).toBeVisible();
    await expect(this.deleteButtons.first()).toBeVisible();
  }

  async verifyMutatingActionsHidden() {
    await expect(this.editButtons).toHaveCount(0);
    await expect(this.deleteButtons).toHaveCount(0);
  }
}
