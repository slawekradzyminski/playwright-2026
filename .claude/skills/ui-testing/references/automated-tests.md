# Automated UI tests

## Before writing

1. Check the screen in `docs/ui-test-plan.md`: current level and planned scenarios.
2. Open the screen (e.g. `playwright-cli`) as the right role and collect the `data-testid` values of the elements you need. Exact texts (titles, errors, toasts) come from the running app, not from guesses.
3. Check what already exists in `pages/`, `pages/components/`, `fixtures/`, `api/`, `generators/` and reuse it.

## Spec structure

```ts
import { expect, test } from '../../fixtures/products.fixture';

test.describe('Products page UI tests', () => {
  test('should add selected quantity of a product to the cart', async ({ productsPage, createProduct, cartApi }) => {
    // given
    const product = await createProduct();
    await productsPage.goto();
    await productsPage.selectCategory(product.category);
    const card = productsPage.productCard(product.name);
    await card.increaseQuantity(2);

    // when
    await card.addButton.click();

    // then
    await productsPage.toast.expectToast('Added to cart', `3 × ${product.name} added to your cart`);
    await expect(card.cartQuantity).toHaveText('3 in cart');
    expect((await cartApi.get()).items).toEqual([{ productId: product.id, quantity: 3 }]);
  });
});
```

- File: `tests/ui/<screen>.ui.spec.ts`, `test.describe('<Screen> UI tests')`, test names start with `should …`.
- `// when` holds exactly the action under test; preparation (navigation, data, preceding clicks) is `// given`.
- A shared `goto()` may live in `beforeEach` when every test starts on the same screen; then a test may begin at `// when`.
- A second when/then pair is fine only for a short flow (e.g. register → log in).
- Parameterise with a `for` loop over a typed array of cases (see `home.ui.spec.ts`, sorting in `products.ui.spec.ts`).
- Assert concrete values (`toHaveText`, `toHaveValue`, `toHaveURL`, `toHaveCount`), web-first assertions only; no `waitForTimeout`.
- Where the UI changes server state, also assert the state through the API (`cartApi.get()`).

## Page objects

- One class per route in `pages/`, extending `BasePage`; set `protected readonly path`.
- Locators are `readonly` fields built in the constructor with `page.getByTestId(...)`.
- Override `expectToBeOpen()` to check a page-specific element (title text) on top of the URL.
- Methods model user actions (`login(credentials)`, `selectCategory(name)`, `search(text)`); assertions that are reused across tests may be methods too (`toast.expectError(...)`).
- Parts that appear on many screens or many times go to `pages/components/` and take a root `Locator` (`ProductCard`) or `Page` (`Toast`, headers).
- Toasts are not uniform: some error toasts (e.g. "Failed to update cart") have no `toast-title` test id, so `Toast.expectError()` fails there. Check the toast's test ids first.
- Dynamic test ids get a helper method that documents the rule (`categoryButton(category)`).
- Register every new page object in `fixtures/pages.fixture.ts`. Pages with route params (`ProductDetailsPage(page, id)`) are created in the test.

## Selectors

1. `getByTestId` – default.
2. `getByRole` with a name – when there is no test id.
3. `getByText` / filter by text – only to pick one item from a list (`productItems.filter({ has: ... getByText(name, { exact: true }) })`).
Never CSS classes, XPath or nth-child. If a needed element has no test id, note it in the plan as a request for the frontend.

## Test data and isolation

- Pick the fixture by role: `pages.fixture` (anonymous), `loggedIn.fixture` (`user` – fresh client, deleted after the test), `loggedInAdmin.fixture` (`admin` – shared, never deleted), `products.fixture` (`createProduct`, `cartApi`).
- Login is injected via `storageState` (tokens in localStorage), never through the login form, except in login tests.
- Data comes from generators (`generateUser`, `generateProduct`, `generateCategory`) with unique values; override only what the test checks.
- Every record a test creates is deleted in fixture teardown (after `use`), whether the test passed or failed. Mind dependencies (clear the cart before deleting a product → 409 otherwise).
- Scope list assertions to the test's own data (own category, own product name). The admin account and dashboards are shared: never assert totals or "first row".
- New API needs: add a client in `api/` (constructor takes `APIRequestContext` and token, methods assert the expected status), types in `types/`, a generator in `generators/`, then a fixture exposing it.
- A fixture that needs HTTP before `storageState` creates its own `playwright.request.newContext({ baseURL })` and disposes it.
- Logged-out case inside a logged-in spec: a nested `describe` with `test.use({ storageState: { cookies: [], origins: [] } })`.
- An id that surely does not exist: create a product through the API and delete it, don't guess a large number. `createProduct` teardown expects 204, so a test that deletes its product itself must not get it from `createProduct`.

## Verify

```bash
npx playwright test tests/ui/<screen>.ui.spec.ts
npx playwright test tests/ui/<screen>.ui.spec.ts --repeat-each=3
npm run test:ui
npx tsc --noEmit
```

All must pass. A known bug is not hidden by a weaker assertion: report it (see [bug-reporting.md](bug-reporting.md)) and leave it out of the suite or mark it `test.fail()` with the bug number in a comment. A `test.fail()` test prints ✘ in the list reporter but counts as passed.
