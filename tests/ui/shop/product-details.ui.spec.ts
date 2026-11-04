import { expect, test } from '../../../fixtures/productDetails.fixture';
import { generateProduct } from '../../../generators/productGenerator';
import { ProductDetailsPage } from '../../../pages/shop/ProductDetailsPage';

// Every test creates its own product, so it never depends on the shared catalog.
test.describe('Product details UI tests', () => {
  test('should show product name, price, description, category and stock', async ({ page, createProduct }) => {
    // given
    const product = await createProduct({ price: 1234.5, stockQuantity: 7 });
    const detailsPage = new ProductDetailsPage(page, product.id);

    // when
    await detailsPage.goto();

    // then
    await detailsPage.expectProduct({ ...product, price: '$1234.50', stock: '7 in stock' });
    await expect(detailsPage.quantity).toHaveText('1');
    await detailsPage.expectNotInCart();
  });

  test('should add selected quantity of the product to the cart', async ({ page, createProduct, cartApi }) => {
    // given
    const product = await createProduct();
    const detailsPage = new ProductDetailsPage(page, product.id);
    await detailsPage.goto();
    await detailsPage.increaseQuantity(2);

    // when
    await detailsPage.addButton.click();

    // then
    await detailsPage.toast.expectToast('Added to cart', `3 × ${product.name} added to your cart`);
    await detailsPage.expectInCart(3);
    expect((await cartApi.get()).items).toEqual([{ productId: product.id, quantity: 3 }]);
  });

  test('should set a new quantity of the product already in the cart', async ({ page, createProduct, cartApi }) => {
    // given
    const product = await createProduct();
    await cartApi.addItem({ productId: product.id, quantity: 2 });
    const detailsPage = new ProductDetailsPage(page, product.id);
    await detailsPage.goto();
    await detailsPage.expectInCart(2);
    await expect(detailsPage.quantity).toHaveText('2');
    await detailsPage.increaseQuantity(2);

    // when
    await detailsPage.addButton.click();

    // then
    await detailsPage.toast.expectToast('Cart updated', `${product.name} quantity set to 4`);
    await detailsPage.expectInCart(4);
    expect((await cartApi.get()).items).toEqual([{ productId: product.id, quantity: 4 }]);
  });

  test('should remove the product from the cart', async ({ page, createProduct, cartApi }) => {
    // given
    const product = await createProduct();
    await cartApi.addItem({ productId: product.id, quantity: 2 });
    const detailsPage = new ProductDetailsPage(page, product.id);
    await detailsPage.goto();

    // when
    await detailsPage.removeButton.click();

    // then
    await detailsPage.toast.expectToast('Removed from cart', `${product.name} has been removed from your cart`);
    await detailsPage.expectNotInCart();
    expect((await cartApi.get()).items).toEqual([]);
  });

  test('should not allow quantity above available stock', async ({ page, createProduct }) => {
    // given
    const product = await createProduct({ stockQuantity: 3 });
    const detailsPage = new ProductDetailsPage(page, product.id);
    await detailsPage.goto();

    // when
    await detailsPage.increaseQuantity(5);

    // then
    await expect(detailsPage.quantity).toHaveText('3');
  });

  test('should not allow adding an out of stock product to the cart', async ({ page, createProduct }) => {
    // given
    const product = await createProduct({ stockQuantity: 0 });
    const detailsPage = new ProductDetailsPage(page, product.id);

    // when
    await detailsPage.goto();

    // then
    await detailsPage.expectOutOfStock();
  });

  test('should show an error when stock dropped below the selected quantity', async ({ page, createProduct, productsApi, cartApi }) => {
    // given
    const product = await createProduct({ stockQuantity: 5 });
    const detailsPage = new ProductDetailsPage(page, product.id);
    await detailsPage.goto();
    await detailsPage.increaseQuantity(3);
    await productsApi.update(product.id, { ...product, stockQuantity: 2 });

    // when
    await detailsPage.addButton.click();

    // then
    // This error toast has no `toast-title` test id (unlike login/register errors), so expectError() cannot be used.
    await expect(detailsPage.toast.root).toContainText('Error');
    await expect(detailsPage.toast.description).toHaveText('Failed to update cart. Please try again.');
    await detailsPage.expectNotInCart();
    expect((await cartApi.get()).items).toEqual([]);
  });

  test('should show an error for a product that does not exist', async ({ page, productsApi }) => {
    // given
    const deleted = await productsApi.create(generateProduct());
    await productsApi.delete(deleted.id);
    const detailsPage = new ProductDetailsPage(page, deleted.id);

    // when
    await detailsPage.open();

    // then
    await expect(detailsPage.notFound).toContainText('Error loading product details');
    await expect(detailsPage.title).toBeHidden();
    await expect(detailsPage.addButton).toBeHidden();
  });

  test('should go back to the product list from the error state', async ({ page, productsApi, productsPage }) => {
    // given
    const deleted = await productsApi.create(generateProduct());
    await productsApi.delete(deleted.id);
    const detailsPage = new ProductDetailsPage(page, deleted.id);
    await detailsPage.open();

    // when
    await detailsPage.notFoundBackLink.click();

    // then
    await productsPage.expectToBeOpen();
  });

  test('should go back to the product list with the back link', async ({ page, createProduct, productsPage }) => {
    // given
    const product = await createProduct();
    const detailsPage = new ProductDetailsPage(page, product.id);
    await detailsPage.goto();

    // when
    await detailsPage.backLink.click();

    // then
    await productsPage.expectToBeOpen();
  });

  test.describe('as anonymous user', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('should redirect to login', async ({ page, createProduct, loginPage }) => {
      // given
      const product = await createProduct();
      const detailsPage = new ProductDetailsPage(page, product.id);

      // when
      await detailsPage.open();

      // then
      await loginPage.expectToBeOpen();
    });
  });
});
