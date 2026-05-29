- Use english in all your responses even though I prompt in polish

For UI tests:
- run newly created tests first and then full suite via `npm run test:ui`
- prefer `data-testid` selectors
- use given (test setup) / when(tested action) / then (assertions)
- use page object model, add pages to `/pages`, add components to `/components`. inject components in pages
- keep `e2e-ui-test-implementation-plan.md` up-to-date after adding a new test suite (make it high-level)
- Prefer workflow (functional) tests over smoke tests.
- Do not add standalone page-load tests unless testing access control, routing, or empty-state availability.
- Before writing tests, explore the page using Playwright CLI and list meaningful user actions.
- Each new spec should include at least one test that performs a real business action and verifies persisted or rendered outcome.
- If skipping an obvious action, document the reason in the implementation plan.
- For mocked deterministic services, assert actual returned content instead of only form state.

Bad UI test examples:
- page loads
- title is visible
- button becomes enabled after typing

Good UI test examples:
- user creates data, sees it persisted after reload
- user submits a form and sees backend-derived result
- user completes a workflow crossing multiple screens
- unauthorized user is denied a protected action