# BUG-002 [FUNCTIONAL] Registration accepts a password made only of spaces

| | |
|---|---|
| Category | Functional |
| Severity / Priority | Major / P2 |
| Environment | All viewports; API and UI |
| Preconditions | Logged out |

**Steps to reproduce**
1. Open `/register`.
2. Fill a unique username and email, first name `John`, last name `Doeson`, password of 8 spaces.
3. Click "Create account".
4. Log in with that username and 8 spaces as the password.

**Expected:** Validation error on the password field (blank password), account not created.

**Actual:** The account is created (redirect to `/login`, `POST /api/v1/users/signup` → 201) and the user can log in with 8 spaces (`POST /api/v1/users/signin` → 200). Other fields reject whitespace-only input ("Username must be at least 4 characters", "Email is required"), only the password does not.

**Evidence:** reproduced through the API as well: signup 201, signin 200.
