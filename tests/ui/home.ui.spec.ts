import { test, expect } from '../../fixtures/ui/loggedInUi.fixture';
import { HomePage } from '../../pages/HomePage';
import { ProductsPage } from '../../pages/ProductsPage';
import { UsersPage } from '../../pages/UsersPage';
import { ProfilePage } from '../../pages/ProfilePage';
import { LlmPage } from '../../pages/LlmPage';
import { TrafficPage } from '../../pages/TrafficPage';
import { QrPage } from '../../pages/QrPage';
import { EmailPage } from '../../pages/EmailPage';

test.describe('Homepage UI tests', () => {
  let homePage: HomePage;
  let destinations: {
    products: ProductsPage;
    users: UsersPage;
    profile: ProfilePage;
    llm: LlmPage;
    traffic: TrafficPage;
    qr: QrPage;
    email: EmailPage;
  };

  test.beforeEach(({ page }) => {
    homePage = new HomePage(page);
    destinations = {
      products: new ProductsPage(page),
      users: new UsersPage(page),
      profile: new ProfilePage(page),
      llm: new LlmPage(page),
      traffic: new TrafficPage(page),
      qr: new QrPage(page),
      email: new EmailPage(page)
    };
  });

  test('should display the authenticated user after direct navigation', async ({ loggedInUser }) => {
    // given
    const { user } = loggedInUser;

    // when
    await homePage.goto();

    // then
    await expect(homePage.root).toBeVisible();
    await expect(homePage.welcomeTitle).toHaveText(`Welcome, ${user.firstName}!`);
    await expect(homePage.userEmail).toHaveText(user.email);
    await expect(homePage.header.profileLink).toHaveText(`${user.firstName} ${user.lastName}`);
  });

  test('should retain the authenticated user after reload', async ({ page, loggedInUser }) => {
    // given
    await homePage.goto();
    await expect(homePage.welcomeTitle).toHaveText(`Welcome, ${loggedInUser.user.firstName}!`);

    // when
    await page.reload();

    // then
    await expect(page).toHaveURL('/');
    await expect(homePage.welcomeTitle).toHaveText(`Welcome, ${loggedInUser.user.firstName}!`);
    await expect(homePage.userEmail).toHaveText(loggedInUser.user.email);
  });

  for (const destination of ['products', 'users', 'profile', 'llm', 'traffic', 'qr', 'email'] as const) {
    test(`should open ${destination} from its homepage shortcut`, async () => {
      // given
      await homePage.goto();

      // when
      await homePage.shortcut(destination).click();

      // then
      await destinations[destination].assertLoaded();
      await expect(homePage.root).not.toBeVisible();
    });
  }

  test('should prevent homepage access after logout and reload', async ({ page }) => {
    // given
    await homePage.goto();
    await expect(homePage.root).toBeVisible();

    // when
    await homePage.header.logoutButton.click();
    await expect(page).toHaveURL('/login');
    await homePage.goto();
    await page.reload();

    // then
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    await expect(homePage.root).not.toBeVisible();
  });
});
