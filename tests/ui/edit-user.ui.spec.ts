import { adminTest, test } from '../../fixtures/ui/commerce';

adminTest('saves edits to a disposable user and returns to the directory', async ({ editUserPage, usersPage, account, adminToken }) => {
  // given
  const details = { email: `edited-${account.user.email}`, firstName: 'Edited', lastName: 'Customer' };
  await usersPage.open();
  await usersPage.edit(account.user.username);
  await editUserPage.expectValues(account.user);
  await editUserPage.fill(details);

  // when
  await editUserPage.save();

  // then
  await usersPage.expectUrl();
  await usersPage.expectUser(account.user.username, details);
  await editUserPage.expectPersisted(account.user.username, adminToken, details);
});

adminTest('cancels a populated edit without saving it', async ({ editUserPage, usersPage, account, adminToken }) => {
  // given
  await editUserPage.open(account.user.username);
  await editUserPage.fill({ email: `unsaved-${account.user.email}`, firstName: 'Unsaved', lastName: 'Change' });

  // when
  await editUserPage.cancel();

  // then
  await usersPage.expectUrl();
  await usersPage.expectUser(account.user.username, account.user);
  await editUserPage.expectPersisted(account.user.username, adminToken, account.user);
});

test('denies a client direct access to user editing', async ({ editUserPage, account }) => {
  // given
  const username = account.user.username;

  // when
  await editUserPage.open(username);

  // then
  await editUserPage.expectDenied();
});
