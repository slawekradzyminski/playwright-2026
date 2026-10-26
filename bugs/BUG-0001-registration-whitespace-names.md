# BUG-0001: Registration accepts first and last names containing only spaces

| Jira field / metadata | Value |
| --- | --- |
| Summary | [API][Registration] firstName and lastName accept values containing only spaces |
| Issue Type | Bug |
| Priority | Medium (proposed) |
| Component/s | API / Users |
| Labels | api, registration, validation |
| Environment | Local application: http://localhost:8081; version/build unknown |
| Verification date | 2026-10-26 |
| Report status | New |
| Jira | To be added once the issue is created |

## Description

The registration endpoint allows creating an account with visually empty first
and last names. Values containing four spaces each are persisted and returned
on subsequent login, resulting in unusable profile names.

## Preconditions

- The application API is available.
- Unique username and email values. Replace `<unique-id>` with a fresh ID for each attempt.
- No Authorization header; registration is a public endpoint.

## Steps to reproduce

1. Send `POST /api/v1/users/signup` with `Content-Type: application/json` and this body:

   ```json
   {
     "username": "bug-0001-<unique-id>",
     "email": "bug-0001-<unique-id>@example.com",
     "password": "TestPassword123!",
     "firstName": "    ",
     "lastName": "    "
   }
   ```

   Both `firstName` and `lastName` contain exactly four ordinary U+0020 spaces.
   The password shown is an example test value only.

2. Check the response status.
3. Send `POST /api/v1/users/signin` with the newly created account's username and password.
4. Inspect `firstName` and `lastName` in the login response.

## Expected result

Registration should return `400` with validation errors for `firstName` and
`lastName`, without creating an account. Both fields should contain non-whitespace
characters.

This business validation expectation requires confirmation by the requirements
owner: the current [OpenAPI contract](http://localhost:8081/v3/api-docs) marks the
fields as required and specifies a length of 4–255, but does not explicitly
exclude whitespace-only values. If this expectation is accepted, the contract
should also be clarified.

## Actual result

- Registration returns `201 Created` with an empty response body.
- Login with the new account returns `200 OK`.
- First and last names still contain four spaces each.

## Evidence

The issue occurred during exploration and was confirmed with a separate request
before this report was written, on 2026-10-26 against the local API.
Selected response fields from the confirmation attempt (tokens and unrelated
data omitted):

```json
{
  "firstName": "    ",
  "lastName": "    "
}
```

Each value had a length of 4. The account created during the confirmation attempt
was deleted by an administrator; the DELETE endpoint returned `204`.

## Acceptance criteria

After the expected business rule is confirmed:

- A first or last name containing only spaces causes registration to return
  `400` with a validation error for the corresponding field, without creating
  an account.
- Valid data satisfying the length constraints still allows account creation
  and login.
- The OpenAPI contract describes the required whitespace validation.
