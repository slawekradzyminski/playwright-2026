# BUG-006: Cart errors are documented as CartDto responses

## Severity rationale

Cart validation/authentication error objects do not match the advertised CartDto across several operations. Contract-based integrations lack the correct error model for recovery, although runtime rejections protect the cart. Integration handling requires an explicit correction; an actual client crash or checkout outage was not observed.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

## Classification
- Type: Documentation/contract
- Category: contract
- Tags: contract, api
- Status: Open
- Severity (proposed): Medium

## Endpoint
GET `/api/v1/cart`; POST `/api/v1/cart/items`; PUT and DELETE `/api/v1/cart/items/{productId}`.

## Environment
- Observed on: 2026-09-08 (source assessment)
- Gateway: configured APP_BASE_URL; runtime confirmed below.
- Source revision: `8cb264a24ef997d635210bc5d0152363f78f8486`; deployed revision unverified.
- Contract: `docs/openapi.json`, cart 400/401 responses.
- Identity: customer/anonymous.

## Preconditions
No data needed for anonymous GET.

## Reproduction
Send `GET /api/v1/cart` without Authorization. For validation, use `POST /api/v1/cart/items`, `Authorization: Bearer <CUSTOMER_TOKEN>`, JSON `{"quantity":1}`.

## Expected
Saved OpenAPI advertises CartDto for these errors. Documentation should describe the actual error response; requirements for successful cart responses must remain separate.

## Actual
Source endpoint assertions expect a field-error map for POST 400; saved OpenAPI references CartDto. Runtime evidence confirms the mismatch; see below.

## Evidence
[Assessment and exploration](../exploration/2026-09-08-cart.md). Initially found by reading AddToCartControllerTest and saved OpenAPI.

## Impact
Consumers may interpret error payloads as empty carts or fail deserialization.

## Cleanup
No resources created during assessment.

## Follow-up and automation
Correct the live and saved error response schemas. Per the clarified project policy, retain tests for correct 400/401 runtime behavior with comments referencing this report. The documentation mismatch stays open. Representative 400 cases and anonymous/invalid-token 401 cases are now automated across the affected cart endpoints after fresh terminal verification.

## Runtime confirmation — 2026-09-08
Status: **Open**. At `http://localhost:8081`, anonymous GET returned `401 application/json`, `{"message":"Unauthorized"}` instead of the documented CartDto shape. Live cart operations/schemas match the saved contract. Backend image 3.7.16 declares revision `1e40f8a8e75538a747befbf9e36b4cd9d44a6848`, different from assessed checkout.
[Sanitized evidence](../exploration/2026-09-08-cart-evidence.md), E08 GET anonymous. No resources created by this probe. Further 400/401 probes recorded in the same evidence.
