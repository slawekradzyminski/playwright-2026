- always use English in your responses even if I speak polish

Backend source code: https://github.com/slawekradzyminski/test-secure-backend (clone it into the scratchpad; treat it as read-only reference)

Exploratory testing (always before writing new automated tests):
- start white-box: read the implementation of the endpoints under test (controllers, DTO validation, services, entities, repositories, exception handlers, security config, profile configuration) and look for bugs by static analysis before sending any request: missing or inconsistent validation, missing normalization (case, whitespace), uniqueness and lookup gaps, unmapped exceptions, authorization order, stale or duplicated state, library limits (e.g. BCrypt 72 bytes), config switches that disable protections
- turn every code-level suspicion into a runtime check; report only what is confirmed at runtime as a bug, and mark code-only findings as such
- then explore the endpoints manually (e.g. with curl) and confront every observed behavior with the implementation: explain each surprising response by the code that produces it
- check which backend revision and profile the running environment uses, since behavior can differ from the code you read
- be thorough, unlike in automation: probe input validation in depth for every field and parameter (missing, null, empty, whitespace-only, wrong type, negative, zero, fractional, boundary and overflow values, malformed JSON, invalid path parameters)
- also check business rules, auth (no token, invalid token, other user's data), state changes and side effects on related resources, and that error responses match the documented schema
- exploration findings decide what is worth automating; they do not all become automated tests

API tests (automation):
- keep the suite lean and prioritized: cover each documented response code with representative cases; detailed input validation belongs in unit tests, so use one representative 400 case per endpoint
- do not add tests that are expected to fail because of known bugs; the bug report's acceptance criteria require a regression test as part of the fix
- keep tests independent: each test creates its own data (users via generators/user-generator.ts, products via generators/product-generator.ts) and cleans it up
- use given (test setup), when (tested action), then (assertions)
- one spec file per endpoint (HTTP method + path), e.g. one file each for GET /api/v1/cart and DELETE /api/v1/cart
- order tests by response code ascending (200 -> 400 -> 401 -> ...)
- store http client logic in http folder
- API is documented here http://localhost:8081/v3/api-docs (use curl to get it)

Bug reports:
- Log every discovered bug using bugs/TEMPLATE.md and the next available BUG-NNNN identifier (shared across folders). Use English.
- One report per root cause, not per symptom: find the cause in the backend code, link the exact lines at a fixed commit, and list the symptoms as rows; add a row to an existing report instead of creating a new one when the fix is the same.
- Put functional bugs in bugs/functional/ and contract/documentation mismatches in bugs/documentation/.
- Put findings that need a product or project decision (business rules, policies, environment configuration) in bugs/QUESTIONS.md instead of filing them as bugs.
- Keep the number of reports small and useful: prefer fewer, well-grouped reports with a clear suggested fix.
