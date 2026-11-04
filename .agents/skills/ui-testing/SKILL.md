---
name: ui-testing
description: UI testing of the awesome-localstack shop app in this repo - writing and extending Playwright UI tests (given/when/then, page objects, data-testid, API-created test data, parallel-safe), running exploratory testing sessions (functional, visual, accessibility, usability), reporting bugs in /bugs from the template, and updating the UI test plan and coverage in docs/ui-test-plan.md. Use whenever the task touches tests/ui, pages/, fixtures/, bugs/ or docs/ui-test-plan.md, or the user asks to test, explore, cover or report bugs for a screen.
---

# UI testing

Five activities share this skill. Pick the matching reference and read it before starting:

| Task | Read |
|---|---|
| Write, extend or fix automated UI tests | [references/automated-tests.md](references/automated-tests.md) |
| Run an exploratory session on a screen | [references/exploratory-testing.md](references/exploratory-testing.md) |
| Report a bug or add a finding | [references/bug-reporting.md](references/bug-reporting.md) + [assets/bug-template.md](assets/bug-template.md) |
| Update coverage, plan or session log | [references/test-plan.md](references/test-plan.md) |
| End of every session: improve this skill | [references/skill-retro.md](references/skill-retro.md) |

## Project map

- `tests/ui/<area>/*.ui.spec.ts` – UI specs, one file per screen or area, grouped by area: `auth/`, `shop/`, `tools/`, `navigation/` (add `admin/`, `users/` when needed).
- `pages/<area>/` – page objects (extend `BasePage`) grouped like the specs (`auth/`, `shop/`, `tools/`, `admin/`, `users/`); `BasePage` and `HomePage` stay in `pages/`, reusable parts in `pages/components/` (headers, `Toast`, `ProductCard`).
- `fixtures/` – `pages.fixture` (page objects), `loggedIn.fixture` (fresh client per test), `loggedInAdmin.fixture` (shared admin), `products.fixture` (`createProduct`, `cartApi`).
- `api/`, `generators/`, `types/` – API clients, faker-based data, DTOs used to set up test data.
- `bugs/` – bug reports and `bugs/img/` screenshots.
- `docs/ui-test-plan.md` – living coverage table and plan; keep it current.
- Config: `APP_BASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` from `.env` (see `test-config.ts`).

## Non-negotiable rules

1. Every test has `// given`, `// when`, `// then` sections (omit a section only when it would be empty).
2. Page object model: no raw locators in specs; screens go to `pages/`, repeated parts to `pages/components/`.
3. `data-testid` selectors (`getByTestId`) wherever the app provides them; fall back to role/text only when it does not.
4. Tests are independent and run in parallel (`fullyParallel: true`): each test creates its own data through the API and cleans it up in fixture teardown; never rely on order, shared catalog or global counters.
5. Test data is set up through the API, not through the UI under test.
6. After the work, update `docs/ui-test-plan.md` (coverage level, tests, session log).
7. End every session with a skill retro ([skill-retro.md](references/skill-retro.md)): what was missing, wrong or unnecessary here; fix facts directly, propose rule changes to the user.

## Typical loop for a screen

1. Automate the main flow and validation → screen reaches level 2 ([automated-tests.md](references/automated-tests.md)).
2. Run an exploratory session on it ([exploratory-testing.md](references/exploratory-testing.md)).
3. Report findings ([bug-reporting.md](references/bug-reporting.md)).
4. Update the plan, coverage summary and regression candidates ([test-plan.md](references/test-plan.md)).
5. Run `npm run test:ui` (or the single spec) and make sure everything passes, also with `--repeat-each=3` for new tests to catch flakiness.
6. Skill retro ([skill-retro.md](references/skill-retro.md)), then `npm run skills:sync` if the skill changed.
