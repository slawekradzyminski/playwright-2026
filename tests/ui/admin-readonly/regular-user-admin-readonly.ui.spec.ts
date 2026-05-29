import { expect, test } from '../../../fixtures/auth.fixture';
import { APP_BASE_URL } from '../../../config/constants';
import { AdminOrdersPage } from '../../../pages/AdminOrdersPage';
import { AdminProductsPage } from '../../../pages/AdminProductsPage';
import { EditUserPage } from '../../../pages/EditUserPage';
import { UsersPage } from '../../../pages/UsersPage';

test.describe('Regular user admin read-only access UI tests', () => {
  test('should redirect regular user away from admin products', async ({ page }) => {
    // given
    const adminProductsPage = new AdminProductsPage(page);

    // when
    await adminProductsPage.goto();

    // then
    await expect(page).toHaveURL(`${APP_BASE_URL}/`);
    await expect(adminProductsPage.pageRoot).toBeHidden();
  });

  test('should redirect regular user away from admin orders', async ({ page }) => {
    // given
    const adminOrdersPage = new AdminOrdersPage(page);

    // when
    await adminOrdersPage.goto();

    // then
    await expect(page).toHaveURL(`${APP_BASE_URL}/`);
    await expect(adminOrdersPage.pageRoot).toBeHidden();
  });

  test('should load users list for regular user without edit or delete actions', async ({ page }) => {
    // given
    const usersPage = new UsersPage(page);

    // when
    await usersPage.goto();

    // then
    await usersPage.verifyLoaded();
    await usersPage.verifyAdminUserListed();
    await usersPage.verifyMutatingActionsHidden();
  });

  test('should deny regular user access to another user edit form', async ({ page }) => {
    // given
    const editUserPage = new EditUserPage(page, 'admin');

    // when
    await editUserPage.goto();

    // then
    await editUserPage.verifyAccessDenied();
  });
});
