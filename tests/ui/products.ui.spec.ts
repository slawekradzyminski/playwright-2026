import { test } from '../../fixtures/ui/products';

test.describe('Products screen', () => {
  test('combines category and case-insensitive search', async ({ productsPage, catalog }) => {
    // given
    await productsPage.open();
    await productsPage.selectCategory(catalog.category);

    // when
    await productsPage.search('BETA');

    // then
    await productsPage.expectProducts([catalog.products[1].name]);
  });

  test('sorts a category by price in both directions', async ({ productsPage, catalog }) => {
    // given
    await productsPage.open();
    await productsPage.selectCategory(catalog.category);
    const [alpha, beta, gamma] = catalog.products;

    // when
    await productsPage.sortBy('Price (Low to High)');

    // then
    await productsPage.expectProducts([beta.name, gamma.name, alpha.name]);

    // when
    await productsPage.sortBy('Price (High to Low)');

    // then
    await productsPage.expectProducts([alpha.name, gamma.name, beta.name]);
  });

  test('recovers from no search results within the selected category', async ({ productsPage, catalog }) => {
    // given
    await productsPage.open();
    await productsPage.selectCategory(catalog.category);
    await productsPage.search('no-matching-catalog-item');
    await productsPage.expectNoResults();

    // when
    await productsPage.clearSearch();

    // then
    await productsPage.expectProducts(catalog.products.map(product => product.name));
  });

  test('opens the selected product details', async ({ productsPage, productDetailsPage, catalog }) => {
    // given
    await productsPage.open();
    const product = catalog.products[0];

    // when
    await productsPage.product(product.name).openDetails();

    // then
    await productDetailsPage.expectUrl(product.id);
    await productDetailsPage.expectProduct(product);
  });

  test('keeps cart items, header count and toasts consistent across add, update and remove', async ({ productsPage, catalog, account, cartWithOtherProduct }) => {
    // given
    await productsPage.open();
    const product = catalog.products[0];
    const card = productsPage.product(product.name);
    const otherItem = { productId: cartWithOtherProduct.id, quantity: 1 };
    await productsPage.header.expectCartCount(1);

    // when
    await card.increaseQuantity();
    await card.saveToCart();

    // then
    await productsPage.toast.expectMessage('Added to cart', `2 × ${product.name} added to your cart`);
    await card.expectInCart(2);
    await productsPage.header.expectCartCount(3);
    await productsPage.expectCartItems(account.token, [otherItem, { productId: product.id, quantity: 2 }]);
    await productsPage.expectUrl();
    await productsPage.reload();
    await card.expectInCart(2);
    await productsPage.header.expectCartCount(3);

    // when
    await card.increaseQuantity();
    await card.saveToCart();

    // then
    await productsPage.toast.expectMessage('Cart updated', `${product.name} quantity set to 3`);
    await card.expectInCart(3);
    await productsPage.header.expectCartCount(4);
    await productsPage.expectCartItems(account.token, [otherItem, { productId: product.id, quantity: 3 }]);
    await productsPage.reload();
    await card.expectInCart(3);
    await productsPage.header.expectCartCount(4);

    // when
    await card.removeFromCart();

    // then
    await productsPage.toast.expectMessage('Removed from cart', `${product.name} has been removed from your cart`);
    await card.expectNotInCart();
    await productsPage.header.expectCartCount(1);
    await productsPage.expectCartItems(account.token, [otherItem]);
    await productsPage.reload();
    await card.expectNotInCart();
    await productsPage.header.expectCartCount(1);

    // when
    await productsPage.product(cartWithOtherProduct.name).removeFromCart();

    // then
    await productsPage.toast.expectMessage('Removed from cart', `${cartWithOtherProduct.name} has been removed from your cart`);
    await productsPage.product(cartWithOtherProduct.name).expectNotInCart();
    await productsPage.expectCartItems(account.token, []);
    await productsPage.header.expectCartCount(0);
    await productsPage.reload();
    await productsPage.header.expectCartCount(0);
  });
});
