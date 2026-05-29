import { test } from '../../fixtures/auth.fixture';
import { CartClient } from '../../http-clients/CartClient';
import { ProductsClient } from '../../http-clients/ProductsClient';
import { sortProductsByName } from '../../utils/productUtils';

test.describe('Profile UI tests', () => {
  test('should update allowed profile fields and persist after reload', async ({ authUser, profilePage }) => {
    // given
    const updatedUser = {
      email: `updated-${authUser.username}@example.com`,
      firstName: 'UpdatedFirst',
      lastName: 'UpdatedLast'
    };
    await profilePage.goto();
    await profilePage.verifyLoaded(authUser);

    // when
    await profilePage.updateProfile(updatedUser);

    // then
    await profilePage.verifyProfileUpdateSucceeded();
    await profilePage.verifyLoaded(updatedUser);

    // when
    await profilePage.page.reload();

    // then
    await profilePage.verifyLoaded(updatedUser);
  });

  test('should reject invalid profile field values', async ({ authUser, profilePage }) => {
    // given
    await profilePage.goto();
    await profilePage.verifyLoaded(authUser);

    // when
    await profilePage.updateProfile({
      email: 'not-an-email',
      firstName: '',
      lastName: ''
    });

    // then
    await profilePage.verifyValidationErrors();

    // when
    await profilePage.page.reload();

    // then
    await profilePage.verifyLoaded(authUser);
  });

  test('should update assistant prompts and persist them after reload', async ({ authUser, profilePage }) => {
    // given
    const prompts = {
      chatPrompt: `Chat profile prompt for ${authUser.username}`,
      toolPrompt: `Tool profile prompt for ${authUser.username}`
    };
    await profilePage.goto();
    await profilePage.verifyLoaded(authUser);

    // when
    await profilePage.updateChatPrompt(prompts.chatPrompt);

    // then
    await profilePage.verifyChatPromptUpdateSucceeded();

    // when
    await profilePage.updateToolPrompt(prompts.toolPrompt);

    // then
    await profilePage.verifyToolPromptUpdateSucceeded();

    // when
    await profilePage.page.reload();

    // then
    await profilePage.verifyLoaded(authUser);
    await profilePage.verifyPromptsPersisted(prompts);
  });

  test('should show a newly placed order in profile history and open its details', async ({
    authUser,
    cartPage,
    checkoutPage,
    orderDetailsPage,
    productsPage,
    profilePage,
    request
  }) => {
    // given
    const quantity = 1;
    const productsClient = new ProductsClient(request, authUser.token);
    const cartClient = new CartClient(request, authUser.token);
    const products = await productsClient.getProducts();
    const product = sortProductsByName(products, 'asc')[0];
    const shippingAddress = {
      street: `Profile Order ${Date.now()} Street`,
      city: 'Warsaw',
      state: 'Masovian',
      zipCode: '00-001',
      country: 'Poland'
    };
    await productsPage.goto();

    // when
    await productsPage.addProductToCartFromList(product.name, quantity);
    await productsPage.header.cartLink.click();

    // then
    await cartPage.verifyLoadedWithItem(product, quantity);
    const cart = await cartClient.getCart();

    // when
    await cartPage.proceedToCheckout();
    await checkoutPage.verifyLoaded(product, quantity);
    await checkoutPage.placeOrder(shippingAddress);

    // then
    await orderDetailsPage.verifyLoaded(product, quantity, shippingAddress);
    const orderId = Number(new URL(orderDetailsPage.page.url()).pathname.split('/').pop());

    // when
    await profilePage.goto();

    // then
    await profilePage.verifyLoaded(authUser);
    await profilePage.verifyOrderVisible({
      id: orderId,
      total: cart.totalPrice,
      itemsCount: quantity
    });

    // when
    await profilePage.filterOrdersByStatus('PENDING');

    // then
    await profilePage.verifyOrderVisible({
      id: orderId,
      total: cart.totalPrice,
      itemsCount: quantity
    });

    // when
    await profilePage.openOrderDetails(orderId);

    // then
    await orderDetailsPage.verifyLoaded(product, quantity, shippingAddress);
  });
});
