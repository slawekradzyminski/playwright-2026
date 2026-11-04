import { expect, test } from '../../../fixtures/products.fixture';

// Every test fills the cart of its own fresh user through the API with its own products, so tests can run in parallel.
test.describe('Cart page UI tests', () => {
  test('should show empty cart message when the cart is empty', async ({ cartPage }) => {
    // when
    await cartPage.goto();

    // then
    await cartPage.expectEmpty();
  });

  test('should show cart items with prices, line totals and cart summary', async ({ cartPage, createProduct, cartApi }) => {
    // given
    const book = await createProduct({ price: 12.5 });
    const laptop = await createProduct({ price: 1234.99 });
    await cartApi.addItem({ productId: book.id, quantity: 2 });
    await cartApi.addItem({ productId: laptop.id, quantity: 1 });

    // when
    await cartPage.goto();

    // then
    await expect(cartPage.itemRows).toHaveCount(2);
    await cartPage.item(book.id).expectItem({ name: book.name, price: '$12.50', quantity: 2, total: '$25.00' });
    await cartPage.item(laptop.id).expectItem({ name: laptop.name, price: '$1234.99', quantity: 1, total: '$1234.99' });
    await cartPage.expectSummary(3, '$1259.99');
  });

  test('should recalculate totals after quantity change is saved', async ({ cartPage, createProduct, cartApi }) => {
    // given
    const book = await createProduct({ price: 12.5 });
    const pen = await createProduct({ price: 5 });
    await cartApi.addItem({ productId: book.id, quantity: 2 });
    await cartApi.addItem({ productId: pen.id, quantity: 1 });
    await cartPage.goto();
    const bookRow = cartPage.item(book.id);
    await bookRow.increaseQuantity(2);
    await expect(bookRow.quantity).toHaveText('4');

    // when
    await bookRow.updateButton.click();

    // then
    await expect(bookRow.total).toHaveText('$50.00');
    await expect(bookRow.updateButton).toBeHidden();
    await cartPage.expectSummary(5, '$55.00');
    expect((await cartApi.get()).items).toEqual([{ productId: book.id, quantity: 4 }, { productId: pen.id, quantity: 1 }]);
  });

  test('should not decrease quantity below 1', async ({ cartPage, createProduct, cartApi }) => {
    // given
    const product = await createProduct();
    await cartApi.addItem({ productId: product.id, quantity: 1 });
    await cartPage.goto();
    const row = cartPage.item(product.id);

    // when
    await row.decreaseButton.click();

    // then
    await expect(row.quantity).toHaveText('1');
    await expect(row.updateButton).toBeHidden();
  });

  test('should remove an item from the cart', async ({ cartPage, createProduct, cartApi }) => {
    // given
    const removed = await createProduct({ price: 12.5 });
    const kept = await createProduct({ price: 5 });
    await cartApi.addItem({ productId: removed.id, quantity: 2 });
    await cartApi.addItem({ productId: kept.id, quantity: 3 });
    await cartPage.goto();

    // when
    await cartPage.item(removed.id).removeButton.click();

    // then
    await expect(cartPage.item(removed.id).root).toBeHidden();
    await expect(cartPage.itemRows).toHaveCount(1);
    await cartPage.expectSummary(3, '$15.00');
    expect((await cartApi.get()).items).toEqual([{ productId: kept.id, quantity: 3 }]);
  });

  test('should empty the cart when "Clear Cart" is confirmed', async ({ cartPage, createProduct, cartApi }) => {
    // given
    const first = await createProduct();
    const second = await createProduct();
    await cartApi.addItem({ productId: first.id, quantity: 2 });
    await cartApi.addItem({ productId: second.id, quantity: 1 });
    await cartPage.goto();

    // when
    await cartPage.clearCart({ confirm: true });

    // then
    await cartPage.expectEmpty();
    expect((await cartApi.get()).items).toEqual([]);
  });

  test('should keep the cart when "Clear Cart" is cancelled', async ({ cartPage, createProduct, cartApi }) => {
    // given
    const product = await createProduct({ price: 20 });
    await cartApi.addItem({ productId: product.id, quantity: 2 });
    await cartPage.goto();

    // when
    await cartPage.clearCart({ confirm: false });

    // then
    await expect(cartPage.item(product.id).quantity).toHaveText('2');
    await cartPage.expectSummary(2, '$40.00');
    expect((await cartApi.get()).items).toEqual([{ productId: product.id, quantity: 2 }]);
  });

  test('should open checkout when "Proceed to Checkout" is clicked', async ({ cartPage, checkoutPage, createProduct, cartApi }) => {
    // given
    const product = await createProduct();
    await cartApi.addItem({ productId: product.id, quantity: 1 });
    await cartPage.goto();

    // when
    await cartPage.checkoutButton.click();

    // then
    await checkoutPage.expectToBeOpen();
  });
});
