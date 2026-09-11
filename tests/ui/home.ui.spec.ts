import { test } from '../../fixtures/ui/authenticated';

test.describe('Home screen', () => {
  test('shows the API-authenticated user after a reload', async ({ homePage, account }) => {
    // given
    await homePage.open();
    await homePage.expectWelcome(account.user);

    // when
    await homePage.reload();

    // then
    await homePage.expectUrl();
    await homePage.expectWelcome(account.user);
    await homePage.header.expectUser(account.user.firstName, account.user.lastName);
  });

  test('opens the product catalog', async ({ homePage, productsPage }) => {
    // given
    await homePage.open();

    // when
    await homePage.goToProducts();

    // then
    await productsPage.expectUrl();
    await productsPage.expectVisible();
  });

  test('opens profile and orders', async ({ homePage, profilePage }) => {
    // given
    await homePage.open();

    // when
    await homePage.goToProfile();

    // then
    await profilePage.expectUrl();
    await profilePage.expectVisible();
  });

  test('opens the users directory', async ({ homePage, usersPage }) => {
    // given
    await homePage.open();

    // when
    await homePage.goToUsers();

    // then
    await usersPage.expectUrl();
    await usersPage.expectVisible();
  });

  test('opens the AI assistant', async ({ homePage, llmPage }) => {
    // given
    await homePage.open();

    // when
    await homePage.goToLlm();

    // then
    await llmPage.expectUrl();
    await llmPage.expectVisible();
  });

  test('opens Traffic Monitor', async ({ homePage, trafficMonitorPage }) => {
    // given
    await homePage.open();

    // when
    await homePage.goToTrafficMonitor();

    // then
    await trafficMonitorPage.expectUrl();
    await trafficMonitorPage.expectVisible();
  });

  test('opens the QR code generator', async ({ homePage, qrCodePage }) => {
    // given
    await homePage.open();

    // when
    await homePage.goToQrCode();

    // then
    await qrCodePage.expectUrl();
    await qrCodePage.expectVisible();
  });

  test('opens Send Email', async ({ homePage, emailPage }) => {
    // given
    await homePage.open();

    // when
    await homePage.goToEmail();

    // then
    await emailPage.expectUrl();
    await emailPage.expectVisible();
  });
});
