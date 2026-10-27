# BUG-0013: Order address DTO has no length limits for bounded storage fields

| Jira field / metadata | Value |
| --- | --- |
| Summary | [Orders] A 256-character address field reaches the database and returns 500 |
| Issue Type | Bug |
| Priority | Medium (proposed) |
| Component/s | API / Orders |
| Labels | api, orders, validation, storage |
| Environment | http://localhost:8081; backend image 3.9.4, profile `local` |
| Backend revision | OCI image revision `fd4c015434dd573f26bf8ff6691ff14611e2f247`; matching source inspected |
| Verification date | 2026-10-27 |
| Report status | New |
| Jira | Not created |

## Description

Checkout validates address presence but not storage length. A nonblank address
can pass DTO validation and fail during persistence. The caller receives a
server error instead of a field-level client error. This is separate from the
product DTO issue in BUG-0009: its fix belongs in the order address DTO.

## Symptoms

Each field was varied independently with an otherwise valid address and a
cart containing one owned product.

| # | Request | Expected | Actual |
| --- | --- | --- | --- |
| 1 | POST `/api/v1/orders`, street of 256 ASCII characters | 400, street length validation | 500 `{"message":"Internal server error"}` |
| 2 | Same, city of 256 characters | 400, city length validation | Same 500 |
| 3 | Same, state of 256 characters | 400, state length validation | Same 500 |
| 4 | Same, country of 256 characters | 400, country length validation | Same 500 |

The 255-character boundary succeeded with 201 for each field. After each
rejected checkout, GET cart still contained its one item and GET product
showed no additional stock deduction.

## Root cause

[AddressDto lines 18–37](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/java/com/awesome/testing/dto/order/AddressDto.java#L18-L37)
uses nonblank validation without maximum lengths. The embedded
[AddressEntity lines 15–20](https://github.com/slawekradzyminski/test-secure-backend/blob/fd4c015434dd573f26bf8ff6691ff14611e2f247/src/main/java/com/awesome/testing/entity/AddressEntity.java#L15-L20)
uses default bounded String columns. Runtime database logs confirmed
`Value too long for column` for STREET, CITY, STATE and COUNTRY. The live
OpenAPI AddressDto schema also has no maximum lengths.

## Steps to reproduce

1. Register a disposable client and create an owned product as admin with stock > 0.
2. Add one unit to that client's cart.
3. POST `/api/v1/orders` as the client with this JSON; replace `<256 x characters>` with exactly 256 ASCII `x` characters:

```json
{"street":"<256 x characters>","city":"Warsaw","state":"MZ","zipCode":"00-001","country":"Poland"}
```

4. Observe 500, then GET cart/product to verify rollback. Repeat for the other fields, changing only one at a time.
5. Delete the disposable client (removes its orders/cart), then the owned product. Never delete shared data.

## Evidence

One 255-character and one 256-character request per field, performed on
2026-10-27. Actual 256 response in all four cases:

```http
HTTP/1.1 500
Content-Type: application/json

{"message":"Internal server error"}
```

Sanitized local details: `artifacts/api-increment-2026-10-27/supervisor-boundary-evidence.json`,
labels `address-*-length-*` and following cart/stock reads.
[Tracked evidence summary](../../docs/api-coverage-increment-2026-10-27.md).
Both probe accounts and the product were deleted with 204.

## Suggested fix

Align DTO maximum lengths and OpenAPI schema with the actual address columns.
Reject overlong input before persistence, using field-level validation errors.

## Acceptance criteria

- All four 256-character inputs return 400 with the offending field identified.
- Supported 255-character values still check out successfully.
- Rejected requests leave cart, order collection and stock unchanged.
- The fix includes automated regression coverage for the boundaries and rollback.
- The live OpenAPI schema publishes the actual maximum lengths.
