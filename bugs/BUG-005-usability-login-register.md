# BUG-005 [USABILITY] Usability findings on Login, Register and Products

| | |
|---|---|
| Category | Usability |
| Severity / Priority | Minor / P4 |
| Environment | Chromium, all viewports; frontend 3.9.1 |
| Preconditions | Logged out for Login/Register; a fresh client for Products, extra products created through the admin API |

## Form fields have no `autocomplete` attributes

**Steps:** Inspect the inputs on `/login` and `/register`.

**Expected:** `autocomplete="username"` / `"current-password"` on login; `"username"`, `"email"`, `"new-password"`, `"given-name"`, `"family-name"` on register, so password managers and browsers fill and save credentials reliably.

**Actual:** `autocomplete` is empty on all 7 inputs.

## Login does not trim spaces around the username

**Steps:**
1. Open `/login`.
2. Enter username `  admin  ` (spaces before and after, e.g. pasted) and the correct password.
3. Click "Sign in".

**Expected:** Leading and trailing spaces are ignored and the user is logged in.

**Actual:** Toast "Invalid username/password"; nothing suggests the spaces are the cause.

## Products: out-of-stock product looks available

**Steps:**
1. As admin create a product with `stockQuantity: 0` (`POST /api/v1/products`).
2. As a client open `/products` and find the product.
3. Click "+".

**Expected:** The card says "Out of stock", the quantity controls are disabled or hidden.

**Actual:** The card shows quantity 1 and a greyed "Add to Cart" with no explanation; clicking "+" changes the quantity to 0. Stock is not shown on the list at all (only on `/products/:id`).

![Out-of-stock card](img/BUG-005-products-out-of-stock-card.png)
![After clicking +](img/BUG-005-products-out-of-stock-after-plus.png)

## Products: quantity can be decreased to 0

**Steps:** On any product card click "-" while the quantity is 1.

**Expected:** "-" is disabled at 1 (minimum quantity in the API is 1).

**Actual:** Quantity becomes 0 and "Add to Cart" is disabled without a message. For a product already in the cart, at 0 the card shows two "Remove" buttons (`product-remove-button` and `product-add-button` relabelled "Remove").

## Products: filters are lost on refresh

**Steps:**
1. Select category "Books", sort "Price (High to Low)", type "a" in search.
2. Refresh the page.

**Expected:** Filters are kept (e.g. in the URL query), so the view can be refreshed, bookmarked and shared.

**Actual:** URL stays `/products`; after refresh the view returns to "All Products", "Name (A-Z)", empty search. (Back from product details does keep the category.)

## Products: prices have no thousands separator

**Steps:** Look at the MacBook Pro 14 price.

**Expected:** `$1,999.99` (en-US formatting).

**Actual:** `$1999.99`; a product priced 99999999.99 shows `$99999999.99`.

## Products: search is diacritics-sensitive

**Steps:** With a product named "Zażółć…", search for `zazolc`.

**Expected:** The product is found (users often type without Polish characters).

**Actual:** No results; only `zażółć` / `ZAŻÓŁĆ` match.
