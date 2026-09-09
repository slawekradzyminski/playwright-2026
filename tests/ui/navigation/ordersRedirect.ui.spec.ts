import { test } from '../../../fixtures/ui/loggedInUi.fixture';
import { ProfilePage } from '../../../pages/ProfilePage';

test.describe('Orders route redirect', () => {
  let profile: ProfilePage;

  test.beforeEach(({ page }) => {
    profile = new ProfilePage(page);
  });

  test('opens the customer profile from the orders route', async ({ page }) => {
    // given: an authenticated customer

    // when
    await page.goto('/orders');

    // then
    await profile.assertLoaded();
  });
});
