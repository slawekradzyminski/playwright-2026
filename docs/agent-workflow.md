# Agent workflow guidance

Source: [OpenAI model guidance](https://developers.openai.com/api/docs/guides/latest-model), reviewed 2026-09-08. The page currently describes GPT-6 Astra. Recheck it before a future model migration; this document records repository workflow decisions, not model configuration.

## Application in this repository

The guide recommends tuning autonomy, instruction precedence, writing, delegation and verification. Here these recommendations apply as follows:

| Area | Repository decision |
| --- | --- |
| Follow-through | Finish the requested scope, using existing clients, fixtures and reports to resolve routine choices. Preserve relevant completed work when requirements change. |
| Instruction conflicts | Keep user intent explicit and explain the exact skill rule behind a blocker. Missing deployment evidence remains a recorded uncertainty; it does not justify inventing results. |
| Communication | Report the outcome and evidence concisely. Keep detailed scenario evidence in exploration reports and defects in bug reports. |
| Delegation | Require authorization and independently owned resources. Backlog work packages alone do not authorize agents. |
| Verification | Preserve exploratory HTTP testing before API automation, affected specs, the API suite and coverage maintenance. Validate prose-only changes with file, link and mirror checks. Avoid rerunning successful checks without a reason. |

These are local adaptations. The guide's sample delegation prompt is optional and does not establish project authorization. Its advice to calibrate testing does not remove this repository's API testing requirements.

## Maintenance boundaries

`AGENTS.md` holds project conventions. `.agents/skills/api-testing` holds the reusable workflow; keep its skill and references synchronized with `.claude/skills/api-testing`. Load detailed references for the applicable phase.

`docs/openapi.json` describes the training backend, including Ollama routes. OpenAI model guidance is not evidence for changing that contract, endpoint expectations or coverage inventory. This update introduces no OpenAI API integration or model-setting changes. API-specific migration parameters and async orchestration require a separate implementation scope and current compatibility checks.

For future instruction edits, check for contradictory stop conditions, accidental scope expansion and duplicate rules. Preserve concrete requirements for response assertions, cleanup, role coverage and bug evidence. For test or contract edits, follow the maintained plan and coverage workflow rather than treating prose validation as sufficient.
