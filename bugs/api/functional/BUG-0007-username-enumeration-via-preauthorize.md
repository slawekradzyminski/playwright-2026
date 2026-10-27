# BUG-0007: Any logged-in user can check whether a username exists

| Jira field / metadata | Value |
| --- | --- |
| Summary | [API][Users] @PreAuthorize checks user existence before permissions, so non-admins get 404 vs 403 |
| Issue Type | Bug |
| Priority | Medium (proposed) |
| Component/s | API / Users |
| Labels | api, security, authorization |
| Environment | Local stack http://localhost:8081, backend image 3.9.4, profile `local` |
| Backend revision | [`3152f6c`](https://github.com/slawekradzyminski/test-secure-backend/tree/3152f6cc331940c6d89eb6eff8e4b5a7b820079e) |
| Verification date | 2026-10-26 |
| Report status | New |
| Jira | To be added once the issue is created |

## Description

`PUT /api/v1/users/{username}` (and, by the same code,
`DELETE /api/v1/users/{username}/right-to-be-forgotten`) answers a client who
targets someone else's account differently depending on whether that account
exists. Any registered user can therefore enumerate usernames, even though the
other user endpoints restrict that information to administrators.

## Symptoms

| # | Request (as a client, not admin) | Expected | Actual |
| --- | --- | --- | --- |
| 1 | `PUT /api/v1/users/<existing other username>` `{"email": "x-<id>@example.com"}` | `403 Access denied` | `403 Access denied` |
| 2 | `PUT /api/v1/users/<non-existent username>` (same body) | `403 Access denied` (same as row 1) | `404 {"message": "The user doesn't exist"}` |

## Root cause

[`UserEditController`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/controller/users/UserEditController.java#L30)
and [`UserRightToBeForgottenController`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/controller/users/UserRightToBeForgottenController.java#L30)
use `@PreAuthorize("@userService.exists(#username) and (hasRole('ROLE_ADMIN') or ...)")`.
[`UserService.exists`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/service/UserService.java#L180)
throws `UserNotFoundException` (mapped to `404`) before the role/ownership
check runs.

## Steps to reproduce

1. Register and log in as a client.
2. Send the requests from rows 1 and 2 with the client's token.

## Evidence

Rows 1–2 were verified once on 2026-10-26 after the code review. The
right-to-be-forgotten endpoint was identified in code only and not called, to
avoid deleting data. Test accounts were deleted afterwards.

## Suggested fix

Evaluate the ownership/role condition first, and check existence only for
administrators (e.g. `hasRole('ROLE_ADMIN') ? exists : #username == principal`).

## Acceptance criteria

- For non-admins, rows 1 and 2 return the same `403` response.
- Admins still get `404` for unknown users, and users can still edit and
  delete themselves.
- The fix includes an automated regression test for this scenario (unit or API
  level, whichever fits the change best).
