# BUG-003 [FUNCTIONAL] Opening `/login` or `/register` while logged in silently logs the user out

| | |
|---|---|
| Category | Functional |
| Severity / Priority | Major / P2 |
| Environment | All viewports |
| Preconditions | Logged in (client or admin) |

**Steps to reproduce**
1. Log in, land on `/`.
2. Type `/login` in the address bar (or follow a bookmark / old link to it).
3. Open `/` again.

**Expected:** A logged-in user opening `/login` or `/register` is redirected to `/` (or sees "You are already signed in"), and the session is kept.

**Actual:** The login form is shown with the logged-out header, `token` is removed from localStorage, and opening `/` redirects to `/login`: the user was logged out without any message.

**Notes:** If clearing the session is intended, it should at least be announced; usability impact: a stale bookmark ends the session.
