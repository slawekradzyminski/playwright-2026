import { test } from '../../fixtures/ui/commerce';

test('adds, updates and removes a product from its detail screen', async ({ productDetailsPage, cartPage, product, account }) => {
  // given
  await productDetailsPage.open(product.id);
  await productDetailsPage.expectProduct(product);

  // when
  await productDetailsPage.increaseQuantity();
  await productDetailsPage.saveToCart();

  // then
  await productDetailsPage.toast.expectMessage('Added to cart', `2 × ${product.name} added to your cart`);
  await productDetailsPage.expectInCart(2);
  await productDetailsPage.header.expectCartCount(2);
  await cartPage.expectPersistedItems(account.token, [{ productId: product.id, quantity: 2 }]);
  await productDetailsPage.reload();
  await productDetailsPage.expectInCart(2);

  // when
  await productDetailsPage.increaseQuantity();
  await productDetailsPage.saveToCart();

  // then
  await productDetailsPage.toast.expectMessage('Cart updated', `${product.name} quantity set to 3`);
  await productDetailsPage.expectInCart(3);
  await productDetailsPage.header.expectCartCount(3);
  await cartPage.expectPersistedItems(account.token, [{ productId: product.id, quantity: 3 }]);

  // when
  await productDetailsPage.removeFromCart();

  // then
  await productDetailsPage.toast.expectMessage('Removed from cart', `${product.name} has been removed from your cart`);
  await productDetailsPage.expectNotInCart();
  await productDetailsPage.header.expectCartCount(0);
  await cartPage.expectPersistedItems(account.token, []);
});

test('prevents adding an out-of-stock product', async ({ productDetailsPage, cartPage, shop, account }) => {
  // given
  const product = await shop.createProduct({ stockQuantity: 0 });

  // when
  await productDetailsPage.open(product.id);

  // then
  await productDetailsPage.expectProduct(product);
  await productDetailsPage.expectOutOfStock();
  await cartPage.expectPersistedItems(account.token, []);
});

test('offers catalog recovery when a product is no longer available', async ({ productDetailsPage, productsPage, deletedProduct }) => {
  // given
  await productDetailsPage.open(deletedProduct.id);
  await productDetailsPage.expectUnavailable();

  // when
  await productDetailsPage.backToProducts();

  // then
  await productsPage.expectUrl();
  await productsPage.expectVisible();
});
