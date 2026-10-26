# BUG-0003: User request DTOs accept blank values and report wrong validation messages

| Jira field / metadata | Value |
| --- | --- |
| Summary | [API][Users] Signup/login validation uses @NotNull/@Size instead of @NotBlank, and reuses "Minimum length" messages for the maximum |
| Issue Type | Bug |
| Priority | Medium (proposed) |
| Component/s | API / Users |
| Labels | api, registration, login, validation |
| Environment | Local stack http://localhost:8081, backend image 3.9.4, profile `local` |
| Backend revision | [`3152f6c`](https://github.com/slawekradzyminski/test-secure-backend/tree/3152f6cc331940c6d89eb6eff8e4b5a7b820079e) |
| Verification date | 2026-10-26 |
| Report status | New |
| Jira | To be added once the issue is created |

## Description

Signup and login validate only `null` and length. Values that are empty or
consist only of whitespace pass, and accounts are created with unusable data.
The same annotations put a "Minimum length" message on the maximum-length
check, and login fields are not required at all. Other DTOs in the same
codebase already use `@NotBlank` (`UserEditDto`, `ResetPasswordRequestDto`,
`AddressDto`), so the rules are inconsistent across endpoints.

## Symptoms

| # | Request | Expected | Actual |
| --- | --- | --- | --- |
| 1 | Signup with `email: ""` | `400 {"email": ...}` | `201`; the account logs in with `"email": ""`, and later empty-email signups get `Email is already in use` |
| 2 | Signup with `firstName`/`lastName` of 4 spaces or 4 tabs | `400` field errors | `201` |
| 3 | Signup with `firstName` of 4 zero-width spaces (`​`) | `400` | `201` (not caught by `@NotBlank` either; needs a pattern) |
| 4 | Signup with `password` of 8 spaces | `400 {"password": ...}` | `201` |
| 5 | Signup with `username`, `firstName` or `password` of 256 characters; signin with both fields at 256 | `400` "Maximum … length: 255" | `400` "Minimum … length: 4 characters" (or 8 for passwords) |
| 6 | Signin with `{}`, `null` fields, or only one field | `400` with field errors | `422 Invalid username/password supplied` |

## Root cause

- [`UserRegisterDto`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/dto/user/UserRegisterDto.java#L21-L43)
  uses `@NotNull` + `@Size` (whitespace counts toward the length). `@Email`
  treats `""` as valid. Each `@Size(min, max)` has one message that mentions
  only the minimum.
- [`LoginDto`](https://github.com/slawekradzyminski/test-secure-backend/blob/3152f6cc331940c6d89eb6eff8e4b5a7b820079e/src/main/java/com/awesome/testing/dto/user/LoginDto.java#L17-L22)
  has `@Size` without `@NotNull`/`@NotBlank`, so null values skip validation
  and fail later in authentication (`422`).

## Steps to reproduce

Send `POST /api/v1/users/signup` with otherwise valid, unique data and the
value from each row (rows 1–5), and `POST /api/v1/users/signin` with the
bodies from row 6.

## Evidence

Each row verified once on 2026-10-26 against the local API. Row 2 was first
reported on 2026-10-26 with a separate confirmation attempt. Test accounts
were deleted afterwards.

## Suggested fix

Use `@NotBlank` (plus a "no invisible characters" pattern for names) on
required string fields. Use separate `@Size` messages for minimum and maximum,
and mark login fields as required. Align `UserRegisterDto` and `LoginDto` with
`UserEditDto`/`ResetPasswordRequestDto`.

## Acceptance criteria

- Every symptom row returns the expected `400` with a message for the field.
- Valid data within the documented limits still registers and logs in.
- The fix includes an automated regression test for this scenario (unit or API
  level, whichever fits the change best).
