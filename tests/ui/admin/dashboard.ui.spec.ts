import { test, expect } from '../../../fixtures/ui/loggedInAdminUi.fixture';
import { AdminDashboardPage } from '../../../pages/AdminDashboardPage';

test.describe('Admin dashboard accuracy', () => {
  let dashboard: AdminDashboardPage;
  test.beforeEach(({ page }) => {
    dashboard = new AdminDashboardPage(page);
  });

  test('shows live product totals and the low stock products returned by the service', async ({ page }) => {
    // given
    const productsResponse = page.waitForResponse(response => response.url().endsWith('/api/v1/products') && response.request().method() === 'GET');

    // when
    await dashboard.goto();
    const response = await productsResponse;
    expect(response.status()).toBe(200);
    const products = await response.json();

    // then
    await dashboard.assertCatalogSummary(products);
  });

  // BUG-046: multi-page aggregate accuracy remains uncovered until the first-50 cap is fixed.
  test('calculates mixed-status metrics and recent ordering from a controlled complete page', async ({ page }) => {
    // given
    const orders = [
      { id: 901, status: 'PAID', totalAmount: 12.34, createdAt: '2026-09-01T10:00:00' },
      { id: 902, status: 'CANCELLED', totalAmount: 99, createdAt: '2026-09-03T10:00:00' },
      { id: 903, status: 'PENDING', totalAmount: 5.67, createdAt: '2026-09-02T10:00:00' }
    ];
    await page.route('**/api/v1/orders/admin?**', route => route.fulfill({ json: { content: orders, totalElements: 3, totalPages: 1, pageNumber: 0, pageSize: 50 } }));

    // when
    await dashboard.goto();

    // then
    await dashboard.assertOrderMetrics({ orders: 3, pending: 1, revenue: 18.01 });
    await dashboard.assertRecentOrders([902, 903, 901]);
    await dashboard.assertManagementLinks();
  });

  test('shows zero metrics and empty panels for controlled empty responses', async ({ page }) => {
    // given
    await page.route('**/api/v1/products', route => route.fulfill({ json: [] }));
    await page.route('**/api/v1/orders/admin?**', route => route.fulfill({ json: { content: [], totalElements: 0, totalPages: 0 } }));

    // when
    await dashboard.goto();

    // then
    await expect(dashboard.productsCount).toHaveText('0');
    await dashboard.assertOrderMetrics({ orders: 0, pending: 0, revenue: 0 });
    await dashboard.assertEmptyPanels();
  });
});
