import { expect, test } from '../../fixtures/products.fixture';
import { generateCategory } from '../../generators/productGenerator';
import { ProductDetailsPage } from '../../pages/ProductDetailsPage';
import type { ProductSort } from '../../pages/ProductsPage';

// Every test creates its own products in its own category, so it never depends on the shared catalog.
test.describe('Products page UI tests', () => {
  test('should show only products of the selected category', async ({ productsPage, createProduct }) => {
    // given
    const category = generateCategory();
    const first = await createProduct({ category });
    const second = await createProduct({ category });
    await productsPage.goto();

    // when
    await productsPage.selectCategory(category);

    // then
    await expect(productsPage.listTitle).toHaveText(`${category} Products`);
    await expect(productsPage.productNames).toHaveText([first.name, second.name].sort((a, b) => a.localeCompare(b)));
  });

  test('should show product name, price, category and description on the card', async ({ productsPage, createProduct }) => {
    // given
    const product = await createProduct({ price: 1234.5 });
    await productsPage.goto();

    // when
    await productsPage.selectCategory(product.category);

    // then
    const card = productsPage.productCard(product.name);
    await expect(card.price).toHaveText('$1234.50');
    await expect(card.category).toHaveText(product.category, { ignoreCase: true });
    await expect(card.description).toHaveText(product.description);
    await expect(card.quantity).toHaveText('1');
    await expect(card.addButton).toHaveText('Add to Cart');
  });

  test('should filter products by search text', async ({ productsPage, createProduct }) => {
    // given
    const category = generateCategory();
    const wanted = await createProduct({ category });
    await createProduct({ category });
    await productsPage.goto();
    await productsPage.selectCategory(category);

    // when
    await productsPage.search(wanted.name.toUpperCase());

    // then
    await expect(productsPage.productNames).toHaveText([wanted.name]);
  });

  test('should show empty state and restore the list after search reset', async ({ productsPage, createProduct }) => {
    // given
    const product = await createProduct();
    await productsPage.goto();
    await productsPage.selectCategory(product.category);
    await productsPage.search(`no-such-product-${product.id}`);
    await expect(productsPage.productItems).toHaveCount(0);

    // when
    await productsPage.resetSearchButton.click();

    // then
    await expect(productsPage.searchInput).toHaveValue('');
    await expect(productsPage.productNames).toHaveText([product.name]);
  });

  const priceSorts: { sort: ProductSort; expected: number[] }[] = [
    { sort: 'price-asc', expected: [10, 20, 30] },
    { sort: 'price-desc', expected: [30, 20, 10] },
  ];

  for (const { sort, expected } of priceSorts) {
    test(`should sort products by ${sort}`, async ({ productsPage, createProduct }) => {
      // given
      const category = generateCategory();
      for (const price of [20, 10, 30]) {
        await createProduct({ category, price });
      }
      await productsPage.goto();
      await productsPage.selectCategory(category);

      // when
      await productsPage.sortBy(sort);

      // then
      await expect(productsPage.productItems.getByTestId('product-price')).toHaveText(expected.map((price) => `$${price.toFixed(2)}`));
    });
  }

  test('should hide out of stock products when "In stock only" is checked', async ({ productsPage, createProduct }) => {
    // given
    const category = generateCategory();
    const inStock = await createProduct({ category, stockQuantity: 5 });
    const outOfStock = await createProduct({ category, stockQuantity: 0 });
    await productsPage.goto();
    await productsPage.selectCategory(category);
    await expect(productsPage.productCard(outOfStock.name).addButton).toBeDisabled();

    // when
    await productsPage.inStockOnlyCheckbox.check();

    // then
    await expect(productsPage.productNames).toHaveText([inStock.name]);
  });

  test('should add selected quantity of a product to the cart', async ({ productsPage, createProduct, cartApi }) => {
    // given
    const product = await createProduct();
    await productsPage.goto();
    await productsPage.selectCategory(product.category);
    const card = productsPage.productCard(product.name);
    await card.increaseQuantity(2);

    // when
    await card.addButton.click();

    // then
    await productsPage.toast.expectToast('Added to cart', `3 × ${product.name} added to your cart`);
    await expect(card.cartQuantity).toHaveText('3 in cart');
    await expect(card.addButton).toHaveText('Update Cart');
    await expect(productsPage.header.cartItemCount).toHaveText('3');
    expect((await cartApi.get()).items).toEqual([{ productId: product.id, quantity: 3 }]);
  });

  test('should set a new quantity of a product already in the cart', async ({ productsPage, createProduct, cartApi }) => {
    // given
    const product = await createProduct();
    await cartApi.addItem({ productId: product.id, quantity: 2 });
    await productsPage.goto();
    await productsPage.selectCategory(product.category);
    const card = productsPage.productCard(product.name);
    await expect(card.quantity).toHaveText('2');
    await card.decreaseButton.click();

    // when
    await card.addButton.click();

    // then
    await productsPage.toast.expectToast('Cart updated', `${product.name} quantity set to 1`);
    await expect(card.cartQuantity).toHaveText('1 in cart');
    expect((await cartApi.get()).items).toEqual([{ productId: product.id, quantity: 1 }]);
  });

  test('should remove a product from the cart', async ({ productsPage, createProduct, cartApi }) => {
    // given
    const product = await createProduct();
    await cartApi.addItem({ productId: product.id, quantity: 2 });
    await productsPage.goto();
    await productsPage.selectCategory(product.category);
    const card = productsPage.productCard(product.name);

    // when
    await card.removeButton.click();

    // then
    await productsPage.toast.expectToast('Removed from cart', `${product.name} has been removed from your cart`);
    await expect(card.cartQuantity).toBeHidden();
    await expect(card.addButton).toHaveText('Add to Cart');
    expect((await cartApi.get()).items).toEqual([]);
  });

  test('should not allow quantity above available stock', async ({ productsPage, createProduct }) => {
    // given
    const product = await createProduct({ stockQuantity: 3 });
    await productsPage.goto();
    await productsPage.selectCategory(product.category);
    const card = productsPage.productCard(product.name);

    // when
    await card.increaseQuantity(5);

    // then
    await expect(card.quantity).toHaveText('3');
  });

  test('should open product details when product name is clicked', async ({ productsPage, createProduct, page }) => {
    // given
    const product = await createProduct({ stockQuantity: 7 });
    await productsPage.goto();
    await productsPage.selectCategory(product.category);

    // when
    await productsPage.productCard(product.name).name.click();

    // then
    const detailsPage = new ProductDetailsPage(page, product.id);
    await detailsPage.expectToBeOpen();
    await expect(detailsPage.title).toHaveText(product.name);
    await expect(detailsPage.stock).toHaveText('7 in stock');
  });
});
