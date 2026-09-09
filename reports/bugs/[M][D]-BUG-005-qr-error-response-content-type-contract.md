# BUG-005: QR error responses are documented as PNG instead of JSON

## Severity rationale

QR validation and authentication errors are JSON while the contract declares PNG, so the advertised decoding format is wrong on normal failure paths. Consumers need a media-type/error-handling correction to expose those responses. Successful QR generation is unaffected; no generated-client outage was exercised.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

## Classification

- Type: Documentation/contract
- Category: contract
- Tags: contract, api
- Status: Open
- Severity (proposed): Medium

## Endpoint

`POST /api/v1/qr/create`

## Environment

- Observed on: 2026-09-08
- Base URL: `http://localhost:8081`
- Application version: OpenAPI `info.version` is `1.0`; deployed revision is not recorded.
- Contract source/version: live `GET /v3/api-docs` and saved [`docs/openapi.json`](../../docs/openapi.json), operation `POST /api/v1/qr/create`
- Identity: Admin for validation; anonymous for authentication; credentials omitted.

## Preconditions

An admin bearer token is required for the validation request. No persistent application state is required.

## Reproduction

1. Read `GET /v3/api-docs`: the operation declares only `image/png` content for responses 400 and 401.
2. Send `POST /api/v1/qr/create` with `Content-Type: application/json`, an admin bearer token, and `{ "text": "" }`.
3. Send the same request without a bearer token and with a non-empty `text`.

## Expected

The OpenAPI response media types must describe the actual error representations: JSON for validation (400) and authentication (401) failures. The public contract must let consumers deserialize the returned error payload rather than interpreting it as a PNG.

## Actual

Both live and saved OpenAPI documents specify `image/png` for 400 and 401. The gateway returned:

- 400 with `Content-Type: application/json` and `{ "text" : "Text is required" }`.
- 401 with `Content-Type: application/json;charset=UTF-8` and a JSON error body.

## Evidence

See [sanitized exploration evidence](../exploration/2026-09-08-post-api-v1-qr-create-evidence.md), scenarios E03a, E03b, and E04. The live QR-operation projection matched the saved contract exactly on 2026-09-08.

## Impact

Clients generated from, or validated against, the OpenAPI contract cannot reliably handle ordinary QR error responses. The documented content type contradicts the wire response.

## Cleanup

The endpoint is stateless. The disposable customer used for the allowed-customer probe was deleted with 204.

## Follow-up and automation

Correct the 400 and 401 OpenAPI response media types and schemas to the JSON error contract, then repeat exploration. At the requester's direction, E03 and E04 are covered by passing status-and-body API tests without content-type assertions; add those assertions after the contract is corrected.
