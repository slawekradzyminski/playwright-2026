import { test } from '../../fixtures/auth.fixture';
import { CartPage } from '../../pages/CartPage';
import { EmailPage } from '../../pages/EmailPage';
import { HomePage } from '../../pages/HomePage';
import { LlmPage } from '../../pages/LlmPage';
import { LoginPage } from '../../pages/LoginPage';
import { ProductsPage } from '../../pages/ProductsPage';
import { ProfilePage } from '../../pages/ProfilePage';
import { QrCodePage } from '../../pages/QrCodePage';
import { TrafficMonitorPage } from '../../pages/TrafficMonitorPage';

test.describe('Home UI tests', () => {
  let cartPage: CartPage;
  let emailPage: EmailPage;
  let homePage: HomePage;
  let llmPage: LlmPage;
  let loginPage: LoginPage;
  let productsPage: ProductsPage;
  let profilePage: ProfilePage;
  let qrCodePage: QrCodePage;
  let trafficMonitorPage: TrafficMonitorPage;

  test.beforeEach(async ({ page }) => {
    cartPage = new CartPage(page);
    emailPage = new EmailPage(page);
    homePage = new HomePage(page);
    llmPage = new LlmPage(page);
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    profilePage = new ProfilePage(page);
    qrCodePage = new QrCodePage(page);
    trafficMonitorPage = new TrafficMonitorPage(page);
  });

  test('should open home page as authenticated user', async ({ page, authUser }) => {
    // given

    // when
    await page.goto(homePage.homeUrl);

    // then
    await homePage.verifyLoggedInUser(authUser);
  });

  test('should navigate with logged in header links', async ({ page, authUser }) => {
    // given
    await page.goto(homePage.homeUrl);
    await homePage.header.verifyVisible(authUser);

    // when
    await homePage.header.productsLink.click();

    // then
    await productsPage.verifyLoaded();

    // when
    await homePage.header.emailLink.click();

    // then
    await emailPage.verifyLoaded();

    // when
    await homePage.header.qrCodeLink.click();

    // then
    await qrCodePage.verifyLoaded();

    // when
    await homePage.header.llmLink.click();

    // then
    await llmPage.verifyLoaded();

    // when
    await homePage.header.trafficMonitorLink.click();

    // then
    await trafficMonitorPage.verifyLoaded();

    // when
    await homePage.header.cartLink.click();

    // then
    await cartPage.verifyEmptyCartLoaded();

    // when
    await homePage.header.profileLink.click();

    // then
    await profilePage.verifyLoaded(authUser);

    // when
    await homePage.header.brandLink.click();

    // then
    await homePage.verifyLoggedInUser(authUser);
  });

  test('should logout from logged in header', async ({ page, authUser }) => {
    // given
    await page.goto(homePage.homeUrl);
    await homePage.header.verifyVisible(authUser);

    // when
    await homePage.header.logoutButton.click();

    // then
    await loginPage.verifyLoaded();
  });

  test('should navigate with home page links', async ({ page, authUser }) => {
    // given
    await page.goto(homePage.homeUrl);

    // when
    await homePage.productsButton.click();

    // then
    await productsPage.verifyLoaded();

    // given
    await page.goto(homePage.homeUrl);

    // when
    await homePage.profileButton.click();

    // then
    await profilePage.verifyLoaded(authUser);

    // given
    await page.goto(homePage.homeUrl);

    // when
    await homePage.llmButton.click();

    // then
    await llmPage.verifyLoaded();

    // given
    await page.goto(homePage.homeUrl);

    // when
    await homePage.trafficButton.click();

    // then
    await trafficMonitorPage.verifyLoaded();
  });

});
