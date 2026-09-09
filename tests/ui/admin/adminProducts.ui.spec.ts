import { randomUUID } from 'node:crypto';
import { test, expect } from '../../../fixtures/ui/adminProductsUi.fixture';
import { AdminProductsPage } from '../../../pages/AdminProductsPage';
import { AdminProductFormPage } from '../../../pages/AdminProductFormPage';

test.describe('Admin products workflows', () => {
  let productsPage: AdminProductsPage;
  let formPage: AdminProductFormPage;

  test.beforeEach(({ page }) => {
    productsPage = new AdminProductsPage(page);
    formPage = new AdminProductFormPage(page);
  });

  test('creates a product and verifies list data plus edit prefill', async ({ page, adminProductIds }) => {
    // given
    const product = { name: `UI Create ${randomUUID()}`, description: 'Disposable create description', price: '19.75', stock: '6', category: 'UI Create Tests' };
    const created = page.waitForResponse(response => response.url().endsWith('/api/v1/products') && response.request().method() === 'POST');

    await productsPage.goto();
    await productsPage.addNew.click();
    await formPage.assertLoaded('create');
    await formPage.fillProduct(product);

    // when
    await formPage.submit.click();
    const response = await created;
    const createdId: number = (await response.json()).id;
    adminProductIds.add(createdId);

    // then
    expect(response.status()).toBe(201);
    await expect(formPage.name).toHaveValue('');
    await productsPage.openFromAdminNavigation();
    await productsPage.assertProduct(createdId, product);

    // when
    await productsPage.edit(createdId).click();

    // then
    await formPage.assertLoaded('edit');
    await formPage.assertProduct(product);
  });

  test('edits product details and preserves them after reloading', async ({ adminProduct }) => {
    // given
    const updated = { name: `UI Edited ${randomUUID()}`, description: 'Updated disposable description', price: '48.50', stock: '11', category: 'UI Edited Tests' };

    await productsPage.goto();
    await productsPage.edit(adminProduct.id).click();
    await formPage.assertLoaded('edit');

    // when
    await formPage.fillProduct(updated);
    await formPage.saveChanges();
    await productsPage.openFromAdminNavigation();

    // then
    await productsPage.assertLoaded();
    await productsPage.assertProduct(adminProduct.id, updated);

    // when
    await productsPage.page.reload();
    await productsPage.assertLoaded();
    await productsPage.edit(adminProduct.id).click();

    // then
    await formPage.assertProduct({ ...updated, price: '48.5' });
  });

  test('deletes an isolated product after dismissing confirmation', async ({ adminProduct }) => {
    // given
    await productsPage.goto();
    await expect(productsPage.row(adminProduct.id)).toBeVisible();

    // when
    await productsPage.requestDeletion(adminProduct.id, 'dismiss');

    // then
    await expect(productsPage.row(adminProduct.id)).toBeVisible();

    // when
    await productsPage.requestDeletion(adminProduct.id, 'accept');

    // then
    await expect(productsPage.row(adminProduct.id)).toHaveCount(0);

    // when
    await productsPage.page.reload();

    // then
    await expect(productsPage.row(adminProduct.id)).toHaveCount(0);
  });

  test('shows required validation and creates after correction', async ({ page, adminProductIds }) => {
    // given
    const product = { name: `UI Validation ${randomUUID()}`, description: 'Required description', price: '22.10', stock: '3', category: 'UI Validation Tests' };
    const created = page.waitForResponse(response => response.url().endsWith('/api/v1/products') && response.request().method() === 'POST');

    await productsPage.goto();
    await productsPage.addNew.click();
    await formPage.assertLoaded('create');

    // when
    await formPage.submit.click();

    // then
    await formPage.assertRequiredFieldErrors();

    // when
    await formPage.fillProduct(product);
    await formPage.submit.click();

    // then
    const response = await created;
    expect(response.status()).toBe(201);
    const id = (await response.json()).id;
    adminProductIds.add(id);
    await expect(formPage.name).toHaveValue('');
  });
});
