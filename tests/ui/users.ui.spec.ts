import { adminTest, test } from '../../fixtures/ui/commerce';

test('shows the directory without admin edit or delete controls for clients', async ({ usersPage, account }) => {
  // given
  const user = account.user;

  // when
  await usersPage.open();

  // then
  await usersPage.expectUser(user.username, user);
  await usersPage.expectClientCannotManage(user.username);
});

adminTest('deletes a disposable user from the directory', async ({ usersPage, account, adminToken }) => {
  // given
  await usersPage.open();
  await usersPage.expectUser(account.user.username, account.user);

  // when
  await usersPage.remove(account.user.username);

  // then
  await usersPage.expectRemoved(account.user.username, adminToken);
});
