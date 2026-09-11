- use English
- use given (test setup), when (tested action), then (assertions)
- separate given, when, and then sections with a blank line in every test; keep each section comment directly above its code

# API test rules
- create http clients for each endpoint
- each endpoint should be tested in separate test file
- order tests by status code ascending (200 -> 400 -> ...)
- make sure tests keep passing - `npm run test:api`
- before automating given tests perform exploratory testing session, see .codex/skills/api-testing/SKILL.md
- initialize clients in beforeEach

# UI test rules
- Prefer `getByTestId` selectors whenever a stable data-testid is available
- Use Page Object Model: one test file per screen, page objects in `pages/`, and reusable components in `pages/components/`.
- Keep locators, UI actions, and all assertions in the relevant page object or component.
- Add shared components to pages through composition
- Initialize page objects in `beforeEach` or test-scoped fixtures
- Before adding or changing UI tests, explore with the global Playwright CLI skill and follow `docs/ui/exploration-workflow.md`
- Automate UI paths on desktop only (1920 × 1080)
- Verify changes with `npm run test:ui`
