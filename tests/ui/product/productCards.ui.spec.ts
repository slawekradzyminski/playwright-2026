import { test, expect } from '../../../fixtures/ui/productsUi.fixture';
import { ProductsPage } from '../../../pages/ProductsPage';
import { CartClient } from '../../../http/cartClient';

test.describe('Product card actions', () => {
  let productsPage: ProductsPage;
  let cartClient: CartClient;

  test.beforeEach(({ page, request }) => {
    productsPage = new ProductsPage(page);
    cartClient = new CartClient(request);
  });

  test('should display product data and a missing-image placeholder', async ({ catalog }) => {
    // given
    const product = catalog.alpha;
    await productsPage.goto();

    // when
    await productsPage.search.fill(product.name);

    // then
    const card = productsPage.card(product.name);
    await expect(card.description).toHaveText(product.description);
    await expect(card.price).toHaveText('$9.99');
    await expect(card.category).toHaveText(product.category);
    await expect(card.noImage).toHaveText('No image available');
    await expect(card.add).toBeEnabled();
  });

  test('should prevent adding an out-of-stock product', async ({ catalog }) => {
    // given
    await productsPage.goto();

    // when
    await productsPage.search.fill(catalog.beta.name);

    // then
    await expect(productsPage.card(catalog.beta.name).add).toBeDisabled();
  });

  test('should stop quantity at zero and disable adding', async ({ catalog }) => {
    // given
    await productsPage.goto();
    await productsPage.search.fill(catalog.alpha.name);
    const card = productsPage.card(catalog.alpha.name);

    // when
    await card.decrease.click();
    await card.decrease.click();

    // then
    await expect(card.quantity).toHaveText('0');
    await expect(card.add).toBeDisabled();
    await productsPage.assertLoaded();
  });

  test('should cap quantity at available stock', async ({ catalog }) => {
    // given
    await productsPage.goto();
    await productsPage.search.fill(catalog.alpha.name);
    const card = productsPage.card(catalog.alpha.name);

    // when
    await card.increase.click();
    await card.increase.click();

    // then
    await expect(card.quantity).toHaveText('2');
    await expect(card.add).toBeEnabled();
    await productsPage.assertLoaded();
  });

  test('should add the selected quantity without opening details', async ({ catalog, loggedInUser }) => {
    // given
    await productsPage.goto();
    await productsPage.search.fill(catalog.alpha.name);
    const card = productsPage.card(catalog.alpha.name);
    await card.increase.click();

    // when
    await card.add.click();

    // then
    await expect(card.cartQuantity).toHaveText('2 in cart');
    await expect(card.add).toHaveText('Update Cart');
    await productsPage.assertLoaded();
    const cart = await cartClient.getCart(loggedInUser.token);
    expect(await cart.json()).toMatchObject({ items: [{ productId: catalog.alpha.id, quantity: 2 }], totalItems: 2, totalPrice: 19.98 });
  });

  test('should update a cart item from its product card', async ({ catalog, loggedInUser }) => {
    // given
    expect((await cartClient.addItem({ productId: catalog.alpha.id, quantity: 2 }, loggedInUser.token)).ok()).toBeTruthy();
    await productsPage.goto();
    await productsPage.search.fill(catalog.alpha.name);
    const card = productsPage.card(catalog.alpha.name);
    await expect(card.quantity).toHaveText('2');
    await card.decrease.click();

    // when
    await card.add.click();

    // then
    await expect(card.cartQuantity).toHaveText('1 in cart');
    const cart = await cartClient.getCart(loggedInUser.token);
    expect(await cart.json()).toMatchObject({ items: [{ productId: catalog.alpha.id, quantity: 1 }], totalPrice: 9.99 });
    await productsPage.assertLoaded();
  });

  test('should remove an item from its product card', async ({ catalog, loggedInUser }) => {
    // given
    expect((await cartClient.addItem({ productId: catalog.alpha.id, quantity: 1 }, loggedInUser.token)).ok()).toBeTruthy();
    await productsPage.goto();
    await productsPage.search.fill(catalog.alpha.name);
    const card = productsPage.card(catalog.alpha.name);

    // when
    await card.remove.click();

    // then
    await expect(card.cartQuantity).toBeHidden();
    await expect(card.add).toHaveText('Add to Cart');
    const cart = await cartClient.getCart(loggedInUser.token);
    expect(await cart.json()).toMatchObject({ items: [], totalItems: 0, totalPrice: 0 });
    await productsPage.assertLoaded();
  });
});
