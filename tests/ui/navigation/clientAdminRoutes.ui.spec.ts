import { test } from '../../../fixtures/ui/loggedInUi.fixture';
import { HomePage } from '../../../pages/HomePage';

const routes = ['/admin', '/admin/products', '/admin/products/new', '/admin/products/edit/1', '/admin/orders', '/admin/inventory', '/admin/inventory/1'];
let home: HomePage;

test.beforeEach(({ page }) => {
  home = new HomePage(page);
});

for (const route of routes) {
  test(`redirects client from ${route} to home`, async ({ page }) => {
    // given: authenticated customer without administrator privileges

    // when
    await page.goto(route);

    // then
    await home.assertLoaded();
  });
}
