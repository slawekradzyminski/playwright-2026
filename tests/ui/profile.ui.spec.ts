import { test, shippingAddress } from '../../fixtures/ui/commerce';

test('saves personal information and both assistant prompts across reload', async ({ profilePage, account }) => {
  // given
  const details = { email: `updated-${account.user.email}`, firstName: 'Updated', lastName: 'Customer' };
  await profilePage.open();
  await profilePage.fillPersonalDetails(details);

  // when
  await profilePage.savePersonalDetails();

  // then
  await profilePage.toast.expectSuccess('User information updated successfully');
  await profilePage.expectPersistedDetails(account.user.username, account.token, details);
  await profilePage.reload();
  await profilePage.expectPersonalDetails(details);

  // when
  await profilePage.savePrompts('Answer briefly using supplied context.', 'Use tools to verify product availability.');

  // then
  await profilePage.toast.expectSuccess('Chat system prompt updated successfully');
  await profilePage.toast.expectSuccess('Tool system prompt updated successfully');
  await profilePage.reload();
  await profilePage.expectPrompts('Answer briefly using supplied context.', 'Use tools to verify product availability.');
});

test('filters order history and opens the matching order', async ({ profilePage, orderDetailsPage, order, product }) => {
  // given
  await profilePage.open();
  await profilePage.expectOrder(order);

  // when
  await profilePage.filterOrders('CANCELLED');

  // then
  await profilePage.expectNoOrders();

  // when
  await profilePage.filterOrders('PENDING');

  // then
  await profilePage.expectOrder(order);

  // when
  await profilePage.viewOrder(order.id);

  // then
  await orderDetailsPage.expectUrl(order.id);
  await orderDetailsPage.expectOrder(order.id, product, 2, shippingAddress);
});
