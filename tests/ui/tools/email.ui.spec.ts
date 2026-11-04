import { expect, test } from '../../../fixtures/email.fixture';

test.describe('Email page UI tests', () => {
  test.beforeEach(async ({ emailPage }) => { await emailPage.goto(); });

  test('should require recipient, subject and message', async ({ emailPage }) => {
    // when
    await emailPage.submit.click();
    // then
    await expect(emailPage.recipientError).toHaveText('Recipient is required');
    await expect(emailPage.subjectError).toHaveText('Subject is required');
    await expect(emailPage.messageError).toHaveText('Message is required');
  });

  test('should reject an invalid recipient', async ({ emailPage, emailEventsApi }) => {
    // given
    await emailPage.recipient.fill('invalid');
    await emailPage.subject.fill('A subject');
    await emailPage.message.fill('A message for testing');
    // when
    await emailPage.submit.click();
    // then
    await expect(emailPage.recipientError).toHaveText('Invalid email address');
    expect(await emailEventsApi.get()).toEqual([]);
  });

  test('should reject a subject and message over their length limits', async ({ emailPage, emailEventsApi }) => {
    // given
    await emailPage.recipient.fill('test@example.invalid');
    await emailPage.subject.fill('s'.repeat(101));
    await emailPage.message.fill('m'.repeat(1001));
    // when
    await emailPage.submit.click();
    // then
    await expect(emailPage.subjectError).toHaveText('Subject must be at most 100 characters');
    await expect(emailPage.messageError).toHaveText('Message must be at most 1000 characters');
    expect(await emailEventsApi.get()).toEqual([]);
  });

  test('should submit an email and record its delivery event', async ({ emailPage, emailEventsApi, user }) => {
    // given
    const data = { to: `${user.username}@example.invalid`, subject: `Subject ${user.username}`, message: 'A message for testing' };
    await emailPage.recipient.fill(data.to);
    await emailPage.subject.fill(data.subject);
    await emailPage.message.fill(data.message);
    // when
    const responsePromise = emailPage.page.waitForResponse(r => r.url().endsWith('/api/v1/email') && r.request().method() === 'POST');
    await emailPage.submit.click();
    const response = await responsePromise;
    // then
    expect(response.status()).toBe(200);
    expect(response.request().postDataJSON()).toEqual(data);
    await expect(emailPage.toast.title).toHaveText('Success');
    const events = await emailEventsApi.get();
    expect(events).toEqual([expect.objectContaining({
      type: 'GENERIC',
      recipientMasked: `${user.username[0]}***@example.invalid`,
    })]);
    expect(['QUEUED', 'SENT_TO_SMTP_SINK']).toContain(events[0].status);
  });
});
