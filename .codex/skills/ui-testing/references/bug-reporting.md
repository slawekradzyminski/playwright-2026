# Report UI findings

Read `docs/bugs/ui/README.md` and relevant reports before creating a finding. Extend an existing report when it describes the same independently fixable problem.

Use the [template](bug-report-template.md). It defines categories, impact-based H/M/L criteria, evidence fields and retest requirements. Allocate the next unused UI-NN ID and retain it when status or severity changes. Save reports in `docs/bugs/ui/` with `[severity][type] ID - Short description.md` filenames. Present the observed failure, expected behavior and demonstrated impact before selecting severity. Keep register links, severity and status consistent with the report.

Report clear functional, visual and accessibility failures with reproducible evidence. For subjective UX changes or uncertain requirements use **Needs clarification**, show the relevant screenshot and seek the user's decision while continuing independent work. Separate suspected causes and possible consequences from observations. Network duplication and slow timings need context and repeat measurements before claims about impact.

Keep sanitized essential DOM properties, console messages, request counts and measured timings in the report so it remains useful in another checkout. Screenshot paths in the template are relative to reports saved in `docs/bugs/ui/`, not to this skill. Raw screenshots and traces stay under ignored `exploration/ui/`; include selected durable images only when needed and authorized by scope. Never publish credentials, cookies or tokens.

Use **Open**, **Needs clarification**, **Fixed, awaiting retest**, and **Verified** consistently. A passing suite does not close a bug: record reproduction against the fixed build and relevant neighboring checks before marking Verified. These are repository reports; external issue publication is a separate action.
