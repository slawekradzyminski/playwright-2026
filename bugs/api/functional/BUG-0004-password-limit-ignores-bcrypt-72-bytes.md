# BUG-0004: Password rules ignore BCrypt's 72-byte limit

| Jira field / metadata | Value |
| --- | --- |
| Summary | [API][Users] Password length is validated in characters (up to 255, or unlimited), but BCrypt only accepts 72 bytes |
| Issue Type | Bug |
| Priority | Medium (proposed) |
| Component/s | API / Users |
| Labels | api, registration, login, password-reset, security |
| Environment | Local stack http://localhost:8081, backend image 3.9.4, profile `local` |
| Backend revision | [`3152f6c`](https://github.com/slawekradzyminski/test-secure-backend/tree/3152f6cc331940c6d89eb6eff8e4b5a7b820079e) |
| Verification date | 2026-10-26 |
| Report status | New |
| Jira | To be added once the issue is created |

## Description

Passwords are hashed with BCrypt, which accepts at most 72 bytes. Validation
does not reflect that limit:

- Signup allows 255 characters.
- Password reset has no maximum.
- Login never checks the limit.

Users with long or non-ASCII passwords (Polish letters take 2 bytes, emoji 4)
get a library error instead of a validation message. Login accepts a password
that differs from the registered one after byte 72.

## Symptoms

| # | Request | Expected | Actual |
| --- | --- | --- | --- |
| 1 | Signup with `password` of 255 × `p`, 37 × `ł` (74 bytes) or 18 × `😀` + `ab` (74 bytes) | Accepted, or `400 {"password": "Maximum …"}` matching the documented limit | `400 {"error": "password cannot be more than 72 bytes"}` |
| 2 | `POST /api/v1/users/password/reset` with a 300-character `newPassword` | `400 {"newPassword": ...}` | `400 {"error": "password cannot be more than 72 bytes"}` |
| 3 | Register with a 72-byte password, then sign in with that password + `EXTRA` | `422` | `200` with tokens |

## Root cause

- Hashing uses [`new BCryptPasswordEncoder(12)`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/security/WebSecurityConfig.java#L139).
  It throws `IllegalArgumentException` when encoding more than 72 bytes and
  compares only the first 72 bytes when matching.
- Validation counts characters, not bytes:
  [`UserRegisterDto` `@Size(max = 255)`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/dto/user/UserRegisterDto.java#L32);
  [`ResetPasswordRequestDto`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/dto/password/ResetPasswordRequestDto.java#L23)
  has no maximum; `LoginDto` caps at 255.
- The library exception reaches the client through the generic
  `IllegalArgumentException` handler (see [BUG-0006](BUG-0006-unmapped-exceptions-500-and-default-errors.md)).

## Steps to reproduce

See the symptom rows. For row 2, request a reset token via
`POST /api/v1/users/password/forgot` (the `local` profile returns it in the
response).

## Evidence

Rows 1 and 3 were verified once each on 2026-10-26. Row 2 was verified once on
2026-10-26 after the code review. A 72-byte ASCII password is accepted. Test
accounts were deleted afterwards.

## Suggested fix

Define one password policy (one validator shared by signup, reset and, for the
maximum, login) that limits UTF-8 bytes to 72. Alternatively, pre-hash
passwords (or use an encoder without the limit) if longer passwords must be
supported. Then update the contract
([BUG-0008](../documentation/BUG-0008-openapi-contract-mismatches.md)).

## Acceptance criteria

- Signup and reset reject passwords above the agreed limit with a
  `password`/`newPassword` field error (rows 1–2).
- Login with a password that differs in any byte returns `422` (row 3).
- Passwords within the limit, including non-ASCII ones, keep working.
- The fix includes an automated regression test for this scenario (unit or API
  level, whichever fits the change best).
