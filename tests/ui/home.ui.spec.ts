import { expect, test } from '../../fixtures/loggedIn.fixture';

test.describe('Home page UI tests', () => {
  test('should greet logged in user', async ({ homePage, user }) => {
    // when
    await homePage.goto();

    // then
    await expect(homePage.welcomeTitle).toHaveText(`Welcome, ${user.firstName}!`);
    await expect(homePage.profileLink).toHaveText(`${user.firstName} ${user.lastName}`);
  });
});
