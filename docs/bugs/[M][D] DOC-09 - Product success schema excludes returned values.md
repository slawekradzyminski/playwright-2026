# [D] Product endpoints — successful responses contain values outside the declared schema

Status: Open. Observed twice on 2026-09-10 at http://localhost:8081 with configured administrator and disposable products. Deployed image/source revision unknown. Live specification captured in ignored `exploration/products-openapi.json`; the earlier snapshot is retained.

## Evidence and reproduction

POST `/api/v1/products` as admin with name `Example product`, description `Example`, price `12.34`, stockQuantity `2`, category `Testing`, and no imageUrl. All required fields are supplied; imageUrl is optional.

Actual: 201 with `imageUrl: null`. ProductDto declares imageUrl as string without null. A complete creation also returned `createdAt: "2026-09-10T10:30:02.809462"` and `updatedAt: "2026-09-10T10:30:02.809484"`. These have no UTC designator or offset, whereas ProductDto declares `format: date-time` (RFC 3339). GET list/by-ID and PUT return the same timestamp representation. The repeat session reproduced both representations. Every exploratory product was deleted with a verified 204 response.

## Impact assessment

Normal successful catalog operations contradict their response types. Strict schema consumers can reject an otherwise valid product, and timestamp consumers cannot determine an absolute instant from the supplied value alone. No downstream production failure was demonstrated; consumers can temporarily tolerate null and treat timestamps as local values if the timezone is known separately.

Severity: **Medium**. Category: Documentation.

## Expected correction and retest

Declare imageUrl nullable. Agree whether timestamps should carry an offset (preferred for an absolute instant) or be explicitly documented as local date-times with their timezone semantics. Verify POST, GET list/by-ID and PUT against the agreed schema after correction. Do not add a regression asserting the current timezone omission as desirable behavior.

## Supervisor reassessment — 2026-09-10

Gateway: `http://localhost:8081`; deployed backend image: `slawekradzyminski/backend:3.7.16`. The live OpenAPI was compared structurally with the retained September 10 snapshot and matched exactly. Local source HEAD is `8cb264a24ef997d635210bc5d0152363f78f8486`; deployed source revision remains unverified. This is a current-build reproduction/evidence review, not a fixed-build verification.

Fresh product creation again returned imageUrl null and createdAt/updatedAt without an offset or UTC designator. The live ProductDto still declares a non-null string and date-time formats. The product was removed with 204. Retain Medium for response-contract incompatibility, not a demonstrated catalog outage.
