# BUG-027: Prompt endpoint 401 responses use an error body outside the documented schema

## Severity rationale

Prompt operations advertise prompt DTOs for authentication errors but return error objects. Contract-based consumers need corrected error models, consistently with account and cart findings. Authentication is still rejected correctly and valid prompt operations are not shown to fail; an actual client outage was not tested.

Evidence reviewed on 2026-09-09 from this report; no new reproduction.

## Classification

- Type: Documentation/contract
- Category: contract
- Tags: contract, api
- Status: Open
- Severity (proposed): Medium

## Endpoint

`GET /api/v1/users/chat-system-prompt`, `PUT /api/v1/users/chat-system-prompt`, `GET /api/v1/users/tool-system-prompt`, and `PUT /api/v1/users/tool-system-prompt`

## Environment

- Observed on: 2026-09-08
- Base URL: configured `APP_BASE_URL` gateway (omitted from committed evidence)
- Application version: deployed image `3.7.16`, OCI revision `1e40f8a8e75538a747befbf9e36b4cd9d44a6848` per supervisor
- Contract source/version: `docs/openapi.json`
- Identity: anonymous and invalid-bearer requests; no credentials recorded

## Preconditions

No authenticated state is required.

## Reproduction

1. Send an unauthenticated GET or PUT to either prompt endpoint.
2. Repeat with `Authorization: Bearer invalid-token`.

## Expected

The saved OpenAPI 401 responses reference the prompt DTO schema for these operations. The contract should describe the actual authentication error shape, or the gateway should return the documented schema.

## Actual

Anonymous requests return 401 with `{"message":"Unauthorized"}`. Invalid bearer requests return 401 with `{"message":"Invalid or expired token"}`. These bodies are error objects and do not match `ChatSystemPromptDto` or `ToolSystemPromptDto`.

## Evidence

- Exploration: [2026-09-08-prompts.md](../exploration/2026-09-08-prompts.md), E04/E04b/E10/E10b.
- Reproduced for GET and PUT on both prompt families.
- Sanitized raw bodies: anonymous `{"message":"Unauthorized"}`; invalid bearer `{"message":"Invalid or expired token"}`.

## Impact

Consumers generated from the contract may reject or mis-deserialize normal 401 responses, and contract tests cannot validate the observed error body without a documented error schema.

## Cleanup

No resources created.

## Follow-up and automation

Retain 401 security tests for all four operations and assert the observed error object. This documentation mismatch does not suppress verified 401 coverage. Reconcile the OpenAPI 401 response schemas after contract ownership clarifies the intended error DTO.
