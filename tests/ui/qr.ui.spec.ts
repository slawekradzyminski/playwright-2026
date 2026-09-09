import { test, expect } from '../../fixtures/ui/loggedInUi.fixture';
import { QrPage } from '../../pages/QrPage';

test.describe('QR generator UI', () => {
  let qr: QrPage;

  test.beforeEach(({ page }) => {
    qr = new QrPage(page);
  });

  test('should generate a QR encoding the submitted URL and clear the result', async () => {
    // given
    await qr.goto();
    const text = 'https://example.test/qr?trial=1440';

    // when
    await qr.generate(text);

    // then
    await qr.assertDecodedText(text);
    await qr.clearButton.click();
    await expect(qr.textInput).toHaveValue('');
    await expect(qr.image).toHaveCount(0);
    await expect(qr.clearButton).toBeDisabled();
  });

  test('should reject whitespace without requesting a QR', async ({ page }) => {
    // given
    await qr.goto();
    const requests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/v1/qr/create')) requests.push(request.url());
    });

    // when
    await qr.generate('   ');

    // then
    await qr.toast.assertError('Please enter text to generate QR code');
    await expect(qr.image).toHaveCount(0);
    expect(requests).toEqual([]);
  });

  test('should retain text after a simulated generation error and allow a live retry', async ({ page }) => {
    // given
    await qr.goto();
    await page.route('**/api/v1/qr/create', route => route.fulfill({ status: 503, json: { message: 'Simulated service unavailable' } }));
    await qr.generate('Recovery trial');
    await qr.toast.assertError('Failed to generate QR code');
    await expect(qr.textInput).toHaveValue('Recovery trial');
    await expect(qr.image).toHaveCount(0);
    await page.unroute('**/api/v1/qr/create');

    // when
    await qr.generateButton.click();

    // then
    await qr.assertDecodedText('Recovery trial');
  });
});
