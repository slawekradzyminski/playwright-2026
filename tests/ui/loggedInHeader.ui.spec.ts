import { test, expect } from '../../fixtures/ui/loggedInUi.fixture';
import { HomePage } from '../../pages/HomePage';
import { ProductsPage } from '../../pages/ProductsPage';
import { EmailPage } from '../../pages/EmailPage';
import { QrPage } from '../../pages/QrPage';
import { LlmPage } from '../../pages/LlmPage';
import { TrafficPage } from '../../pages/TrafficPage';
import { CartPage } from '../../pages/CartPage';
import { ProfilePage } from '../../pages/ProfilePage';

test.describe('Logged-in header navigation', () => {
  let homePage: HomePage;
  let profilePage: ProfilePage;
  let cartPage: CartPage;
  let destinations: {
    products: ProductsPage;
    email: EmailPage;
    qr: QrPage;
    llm: LlmPage;
    traffic: TrafficPage;
  };

  test.beforeEach(({ page }) => {
    homePage = new HomePage(page);
    profilePage = new ProfilePage(page);
    cartPage = new CartPage(page);
    destinations = {
      products: new ProductsPage(page),
      email: new EmailPage(page),
      qr: new QrPage(page),
      llm: new LlmPage(page),
      traffic: new TrafficPage(page)
    };
  });

  test('should not show admin navigation to a client', async ({ loggedInUser }) => {
    // given
    const { user } = loggedInUser;

    // when
    await homePage.goto();

    // then
    await homePage.assertLoaded();
    await expect(homePage.header.profileLink).toHaveText(`${user.firstName} ${user.lastName}`);
    await expect(homePage.header.adminLink).toHaveCount(0);
  });

  for (const destination of ['products', 'email', 'qr', 'llm', 'traffic'] as const) {
    test(`should open ${destination} from the navbar`, async () => {
      // given
      await homePage.goto();

      // when
      await homePage.header.link(destination).click();

      // then
      await destinations[destination].assertLoaded();
      await expect(homePage.root).not.toBeVisible();
    });
  }

  test('should open the profile using the account link', async ({ loggedInUser }) => {
    // given
    await homePage.goto();
    await expect(homePage.header.profileLink).toHaveText(`${loggedInUser.user.firstName} ${loggedInUser.user.lastName}`);

    // when
    await homePage.header.profileLink.click();

    // then
    await profilePage.assertLoaded();
    await expect(profilePage.emailInput).toHaveValue(loggedInUser.user.email);
  });

  test('should open the cart using the header icon', async () => {
    // given
    await homePage.goto();

    // when
    await homePage.header.cartLink.click();

    // then
    await cartPage.assertLoaded();
  });

  test('should return home using the logo from a destination page', async ({ loggedInUser }) => {
    // given
    await homePage.goto();
    await homePage.header.cartLink.click();
    await cartPage.assertLoaded();

    // when
    await cartPage.header.homeLink.click();

    // then
    await homePage.assertLoaded();
    await expect(homePage.welcomeTitle).toHaveText(`Welcome, ${loggedInUser.user.firstName}!`);
  });
});
