import { test } from '../../../fixtures/admin.fixture';
import { AdminOrdersPage } from '../../../pages/AdminOrdersPage';
import { AdminProductsPage } from '../../../pages/AdminProductsPage';
import { EditUserPage } from '../../../pages/EditUserPage';
import { UsersPage } from '../../../pages/UsersPage';

test.describe('Admin read-only UI tests', () => {
  test('should load admin products without changing product data', async ({ page }) => {
    // given
    const adminProductsPage = new AdminProductsPage(page);

    // when
    await adminProductsPage.goto();

    // then
    await adminProductsPage.verifyLoaded();
  });

  test('should load admin orders without changing order data', async ({ page }) => {
    // given
    const adminOrdersPage = new AdminOrdersPage(page);

    // when
    await adminOrdersPage.goto();

    // then
    await adminOrdersPage.verifyLoaded();
  });

  test('should load users management list without changing users', async ({ page, adminUser }) => {
    // given
    const usersPage = new UsersPage(page);

    // when
    await usersPage.goto();

    // then
    await usersPage.verifyLoaded();
    await usersPage.verifyAdminUserListed(adminUser.displayName);
    await usersPage.verifyMutatingActionsVisible();
  });

  test('should load admin self edit form without saving changes', async ({ page, adminUser }) => {
    // given
    const editUserPage = new EditUserPage(page, adminUser.username);

    // when
    await editUserPage.goto();

    // then
    await editUserPage.verifyLoaded(adminUser.username);
  });
});
