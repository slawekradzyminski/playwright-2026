import { test as clientTest, adminTest } from '../../fixtures/ui/authenticated';

clientTest.describe('Authenticated header — client', () => {
  clientTest('opens products', async ({ homePage, productsPage }) => {
    // given
    await homePage.open();

    // when
    await homePage.header.goToProducts();

    // then
    await productsPage.expectUrl();
    await productsPage.expectVisible();
  });

  clientTest('opens Send Email', async ({ homePage, emailPage }) => {
    // given
    await homePage.open();

    // when
    await homePage.header.goToSendEmail();

    // then
    await emailPage.expectUrl();
    await emailPage.expectVisible();
  });

  clientTest('opens QR Code', async ({ homePage, qrCodePage }) => {
    // given
    await homePage.open();

    // when
    await homePage.header.goToQrCode();

    // then
    await qrCodePage.expectUrl();
    await qrCodePage.expectVisible();
  });

  clientTest('opens LLM', async ({ homePage, llmPage }) => {
    // given
    await homePage.open();

    // when
    await homePage.header.goToLlm();

    // then
    await llmPage.expectUrl();
    await llmPage.expectVisible();
  });

  clientTest('opens Traffic Monitor', async ({ homePage, trafficMonitorPage }) => {
    // given
    await homePage.open();

    // when
    await homePage.header.goToTrafficMonitor();

    // then
    await trafficMonitorPage.expectUrl();
    await trafficMonitorPage.expectVisible();
  });

  clientTest('opens the cart', async ({ homePage, cartPage }) => {
    // given
    await homePage.open();

    // when
    await homePage.header.goToCart();

    // then
    await cartPage.expectUrl();
    await cartPage.expectVisible();
  });

  clientTest('opens the user profile', async ({ homePage, profilePage }) => {
    // given
    await homePage.open();

    // when
    await homePage.header.goToProfile();

    // then
    await profilePage.expectUrl();
    await profilePage.expectVisible();
  });

  clientTest('returns home through the brand', async ({ homePage, productsPage }) => {
    // given
    await productsPage.open();

    // when
    await productsPage.header.goHome();

    // then
    await homePage.expectUrl();
    await homePage.expectAuthenticated();
  });

  clientTest('logs out and prevents reopening home', async ({ homePage, loginPage }) => {
    // given
    await homePage.open();
    await homePage.expectAuthenticated();

    // when
    await homePage.header.logout();

    // then
    await loginPage.expectUrl();
    await loginPage.header.expectVisible();
    await loginPage.header.expectSessionCleared();
    await homePage.open();
    await loginPage.expectUrl();
    await loginPage.header.expectVisible();
  });
});

clientTest.describe('Authenticated header — client permissions', () => {
  clientTest('identifies the signed-in user', async ({ homePage, account }) => {
    // given
    const { firstName, lastName } = account.user;

    // when
    await homePage.open();

    // then
    await homePage.header.expectVisible();
    await homePage.header.expectUser(firstName, lastName);
  });

  clientTest('does not expose the Admin link', async ({ homePage }) => {
    // given
    await homePage.open();
    await homePage.expectAuthenticated();

    // when
    await homePage.reload();

    // then
    await homePage.header.expectAdminLinkAbsent();
  });
});

adminTest.describe('Authenticated header — admin permissions', () => {
  adminTest('shows the Admin link and opens the dashboard', async ({ homePage, adminDashboardPage }) => {
    // given
    await homePage.open();

    // when
    await homePage.header.goToAdmin();

    // then
    await homePage.header.expectAdminLinkVisible();
    await adminDashboardPage.expectUrl();
    await adminDashboardPage.expectVisible();
  });
});
