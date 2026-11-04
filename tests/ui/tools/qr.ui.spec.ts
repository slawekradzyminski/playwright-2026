import { expect, test } from '../../../fixtures/qr.fixture';

// Largest payload a QR code holds in byte mode (version 40, error correction L).
const MAX_QR_LENGTH = 2953;

test.describe('QR code page UI tests', () => {
  test.beforeEach(async ({ qrCodePage }) => {
    await qrCodePage.goto();
  });

  test('should show an empty form with Clear disabled', async ({ qrCodePage }) => {
    // then
    await qrCodePage.expectEmptyForm();
  });

  test('should generate a QR code image for the entered URL', async ({ qrCodePage, qrApi }) => {
    // given
    const text = 'https://www.awesome-testing.com/?utm_source=qr&id=42';
    await qrCodePage.textInput.fill(text);

    // when
    const request = await qrCodePage.generate();

    // then
    expect(request.postDataJSON()).toEqual({ text });
    await expect(qrCodePage.image).toHaveAttribute('alt', 'Generated QR Code');
    expect(await qrCodePage.imageBytes()).toEqual(await qrApi.create({ text }));
    await expect(qrCodePage.clearButton).toBeEnabled();
  });

  test('should clear the text and the generated QR code', async ({ qrCodePage }) => {
    // given
    await qrCodePage.textInput.fill('text to clear');
    await qrCodePage.generate();
    await expect(qrCodePage.image).toBeVisible();

    // when
    await qrCodePage.clearButton.click();

    // then
    await qrCodePage.expectEmptyForm();
  });

  test('should replace the QR code when new text is generated', async ({ qrCodePage, qrApi }) => {
    // given
    await qrCodePage.textInput.fill('first text');
    await qrCodePage.generate();
    await expect(qrCodePage.image).toBeVisible();
    await qrCodePage.textInput.fill('second text');

    // when
    await qrCodePage.generate();

    // then
    await expect.poll(() => qrCodePage.imageBytes()).toEqual(await qrApi.create({ text: 'second text' }));
  });

  const emptyTexts = [
    { name: 'empty', text: '' },
    { name: 'whitespace-only', text: ' \n\t ' },
  ];

  for (const { name, text } of emptyTexts) {
    test(`should show an error and no QR code for ${name} text`, async ({ qrCodePage }) => {
      // given
      await qrCodePage.textInput.fill(text);

      // when
      await qrCodePage.generateButton.click();

      // then
      await qrCodePage.toast.expectError('Please enter text to generate QR code');
      await expect(qrCodePage.image).toBeHidden();
    });
  }

  // The UI must send the text unchanged. BUG-008: the backend encodes characters outside Latin-1 as "?",
  // which only a QR decoder can see (regression candidate at API level).
  const specialTexts = [
    { name: 'Polish diacritics and emoji', text: 'Zażółć gęślą jaźń 😀' },
    { name: 'HTML and script', text: '<script>alert(1)</script><b>bold</b>' },
    { name: 'multiple lines', text: 'line 1\nline 2\n\tindented' },
    { name: 'leading and trailing spaces', text: '  padded  ' },
    { name: `maximum length (${MAX_QR_LENGTH} characters)`, text: 'a'.repeat(MAX_QR_LENGTH) },
  ];

  for (const { name, text } of specialTexts) {
    test(`should generate a QR code for text with ${name}`, async ({ qrCodePage, qrApi }) => {
      // given
      await qrCodePage.textInput.fill(text);

      // when
      const request = await qrCodePage.generate();

      // then
      expect(request.postDataJSON()).toEqual({ text });
      expect(await qrCodePage.imageBytes()).toEqual(await qrApi.create({ text }));
      await expect(qrCodePage.textInput).toHaveValue(text);
    });
  }

  test('should show an error for text longer than the QR capacity', async ({ qrCodePage }) => {
    // given
    await qrCodePage.textInput.fill('a'.repeat(MAX_QR_LENGTH + 1));

    // when
    await qrCodePage.generate();

    // then
    await qrCodePage.toast.expectError('Failed to generate QR code');
    await expect(qrCodePage.image).toBeHidden();
    await expect(qrCodePage.generateButton).toBeEnabled();
  });
});
