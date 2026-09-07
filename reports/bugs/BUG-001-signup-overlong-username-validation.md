# BUG-004: Signup reports the wrong validation message for an overlong username

## Endpoint

`POST /api/v1/users/signup`

## Environment

- Date: 2026-09-07
- Base URL: `http://localhost:8081`
- Contract source: `GET /v3/api-docs`
- Contract: `username` has `minLength: 4` and `maxLength: 255`

## Reproduction

Send a valid signup payload with a username of 256 characters, for example:

```json
{
  "username": "<256 characters>",
  "email": "overlong@example.test",
  "password": "SignupPass123!",
  "firstName": "Test",
  "lastName": "Signup"
}
```

## Expected

HTTP `400` with a username error explaining that the maximum is 255 characters:

```json
{"username":"Username must be at most 255 characters"}
```

## Actual

HTTP `400` with the contradictory minimum-length message:

```json
{"username":"Minimum username length: 4 characters"}
```

The request is rejected, so this is a contract/message defect rather than an acceptance bypass. The automated API test is marked as an expected failure until the backend message is corrected.
