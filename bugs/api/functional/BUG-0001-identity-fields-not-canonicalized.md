# BUG-0001: Username and email have no canonical form, so one identity can map to several accounts

| Jira field / metadata | Value |
| --- | --- |
| Summary | [API][Users] Username/email are stored and compared as raw strings (case, whitespace, control characters, overlapping namespaces) |
| Issue Type | Bug |
| Priority | High (proposed) |
| Component/s | API / Users |
| Labels | api, registration, password-reset, security, data-integrity |
| Environment | Local stack http://localhost:8081, backend image 3.9.4, profile `local` |
| Backend revision | [`3152f6c`](https://github.com/slawekradzyminski/test-secure-backend/tree/3152f6cc331940c6d89eb6eff8e4b5a7b820079e) |
| Verification date | 2026-10-26 |
| Report status | New |
| Jira | To be added once the issue is created |

## Description

Local signup and profile edit store `username` and `email` exactly as sent.
Uniqueness is checked with exact, case-sensitive string comparison. There is
no rule for which characters a username may contain, and a username may look
like an email address. As a result:

- the same mailbox or a look-alike username can belong to several accounts,
- invisible or control characters create accounts that administrators cannot
  manage, and
- a username that equals another user's email breaks that user's password
  reset.

The SSO login path already has a username policy (lowercase, `[a-z0-9._-]`),
but local signup does not use it.

## Symptoms

| # | Request | Expected | Actual |
| --- | --- | --- | --- |
| 1 | Signup `email: "case-<id>@example.com"`, then another signup with `"CASE-<id>@EXAMPLE.COM"` | `400 Email is already in use` | `201`, two accounts share one mailbox |
| 2 | Signup `Mixed-<id>`, then `mixed-<id>` | `400 Username is already in use` (rule to confirm, see [QUESTIONS](../QUESTIONS.md)) | `201`, two look-alike accounts |
| 3 | `PUT /api/v1/users/{me}` with `email` = another user's email in upper case | `400 Email is already in use` | `200`, email changed to the case variant |
| 4 | Signup with username `"    "`, `"  pad-<id>  "`, `"ex <id>"` | `400` username validation error | `201`; padded user can log in only with the exact spaces |
| 5 | Signup with username `"ex-<id>\n"` or `"ex-<id>\u0000"` | `400` | `201`; user logs in, but admin `GET`/`DELETE /api/v1/users/{username}` returns `400` (app error for `%0A`, nginx HTML page for `%00`), so the account cannot be removed |
| 6 | Victim registers `victim-<id>@example.com`; attacker registers **username** `victim-<id>@example.com`; `POST /api/v1/users/password/forgot` `{"identifier": "victim-<id>@example.com"}` | `202`, reset email sent to the victim | `500 {"message": "Internal server error"}`; the victim can no longer reset their password via email |

## Root cause

- Raw values are persisted: [`UserService.getUser(UserRegisterDto)`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/service/UserService.java#L204)
  and [`UserService.edit`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/service/UserService.java#L144)
  copy username/email without trimming or lowercasing.
- Uniqueness is exact-match: [`existsByUsername` / `existsByEmail`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/service/UserService.java#L186-L191)
  and the plain `unique = true` columns in [`UserEntity`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/entity/UserEntity.java#L33-L38)
  are case-sensitive. `edit` performs no uniqueness check at all (an exact
  duplicate ends in `500`, see [BUG-0006](BUG-0006-unmapped-exceptions-500-and-default-errors.md)).
- No username character policy: [`UserRegisterDto`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/dto/user/UserRegisterDto.java#L21-L23)
  only checks `@NotNull` and length. Compare [`SsoLoginService.normalizeUsername`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/service/SsoLoginService.java#L145-L148).
- Overlapping namespaces: password reset resolves the identifier with
  [`findByUsernameOrEmail(identifier, identifier)`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/service/password/PasswordResetService.java#L56)
  into an `Optional`. When one user's username equals another user's email,
  two rows match and the query fails (suspected
  `IncorrectResultSizeDataAccessException`, observed as `500`).
- The SSO email conflict check ([`findByEmail`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/service/SsoLoginService.java#L70))
  has the same case-sensitivity gap (found in code, not verified at runtime).

## Steps to reproduce

Use fresh `<id>` values, no Authorization header for signup and forgot-password,
and a client token for the edit in row 3. Each symptom row is an independent
reproduction.

## Evidence

Rows 1, 2, 4 and 5 were verified once each on 2026-10-26; rows 3 and 6 were
verified once each on 2026-10-26 after the code review. Before the attacker
account existed, the forgot-password request for the victim's email returned
`202`. The two accounts from row 5 (`ex-f653becd2a` + newline, `ex-b700fde4c5`
+ NUL) remain in the local database because the API cannot delete them. All
other test accounts were deleted.

## Suggested fix

- Define one canonical form, used at signup, edit, login, SSO and password
  reset: trim, lowercase email, and a username pattern (for example the SSO
  one, without `@`).
- Back it with case-insensitive unique indexes (e.g. on `lower(email)`).
- Check uniqueness in `edit` as well.
- Look up password reset by email or username unambiguously (e.g. by
  identifier format, or reject usernames that look like emails).
- Migrate or flag existing conflicting and control-character accounts.

## Acceptance criteria

- Every symptom row returns the expected result.
- Existing accounts with non-canonical values are migrated or can be found and
  deleted by an administrator.
- Ordinary usernames and emails still register, log in and reset passwords.
- The fix includes an automated regression test for this scenario (unit or API
  level, whichever fits the change best).
