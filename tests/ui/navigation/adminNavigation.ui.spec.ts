import { test, expect } from '../../../fixtures/ui/loggedInAdminUi.fixture';
import { HomePage } from '../../../pages/HomePage';
import { AdminDashboardPage } from '../../../pages/AdminDashboardPage';

test.describe('Admin header navigation', () => {
  let homePage: HomePage;
  let adminDashboardPage: AdminDashboardPage;

  test.beforeEach(({ page }) => {
    homePage = new HomePage(page);
    adminDashboardPage = new AdminDashboardPage(page);
  });

  test('should show the Admin link and open the dashboard for an admin', async ({ loggedInAdmin }) => {
    // given
    await homePage.goto();
    await expect(homePage.header.profileLink).toHaveText(`${loggedInAdmin.firstName} ${loggedInAdmin.lastName}`);
    await expect(homePage.header.adminLink).toBeVisible();
    await expect(homePage.header.adminLink).toHaveText('Admin');

    // when
    await homePage.header.adminLink.click();

    // then
    await adminDashboardPage.assertLoaded();
    await expect(homePage.root).not.toBeVisible();
  });
});
