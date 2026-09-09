# BUG-050: Collapsed LLM settings expose invisible keyboard stops

## Severity rationale

Keyboard users can enter controls inside collapsed settings that are marked aria-hidden and visually clipped. This makes focus difficult to locate and permits editing hidden generation settings. Opening settings provides a recovery path; no persistent changes were exercised. Keyboard reproduction confirmed Tab reaches hidden model, temperature and thinking controls before Settings.

## Classification

- Type: Functional
- Category: accessibility
- Tags: ui, accessibility
- Status: Open
- Severity (proposed): Medium

## Endpoint

`/llm/generate`, `/llm/chat`, `/llm/tools` (confirmed on all three shared LlmSettingsPanel instances)

## Environment

2026-09-09, http://localhost:8081, backend 3.7.16, frontend 3.7.14, mock 1.0.9. Disposable customer / anonymous. Contract: docs/openapi.json and live /v3/api-docs.

## Preconditions

Authenticated disposable customer for valid and validation requests; no authentication for unauthorized scenarios.

## Reproduction

Open the LLM generate page with settings collapsed. Tab from Back to overview through the hidden panel; inspect document.activeElement. Run axe on main.

## Expected

Collapsed settings should remove descendants from keyboard navigation (e.g. inert or conditional rendering); visible controls need visible focus.

## Actual

axe-core reports aria-hidden-focus on the collapsed settings ancestor containing model input, range and checkbox.

## Evidence

../exploration/ui/2026-09-09-ollama-01/axe-generate-initial.json. Evidence is ignored and available only in the originating workspace; textual steps above are portable.

## Impact

Keyboard users can enter controls inside collapsed settings that are marked aria-hidden and visually clipped. This makes focus difficult to locate and permits editing hidden generation settings. Opening settings provides a recovery path; no persistent changes were exercised. Keyboard reproduction confirmed Tab reaches hidden model, temperature and thinking controls before Settings.

## Cleanup

API exploration account deleted (204); browser account deleted through the existing API factory and saved authentication removed. No shared settings or seeded products changed.

## Follow-up and automation

Verify keyboard behavior on all three pages; fix shared settings panel before adding a regression assertion.

![Collapsed generate settings at 1440×900](../exploration/ui/2026-09-09-ollama-01/screenshots/generate-initial-desktop.png)
