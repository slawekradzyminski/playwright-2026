# [FA] POST /api/v1/users/signin — Maximum-length violations show a minimum-length error

**ID:** BUG-03  
**Status:** Open
**Category:** FA — Functional API  
**Observed on:** 2026-09-10

## Environment and preconditions

- Base URL: `http://localhost:8081`; deployed image: `slawekradzyminski/backend:3.7.16`; profile: `local`.
- Local demo accounts; tested client account had MFA disabled. Commands using `client/client` assume that documented local fixture.
- [Swagger UI](http://localhost:8081/swagger-ui/index.html) · [session OpenAPI snapshot](../../exploratory-testing/openapi-2026-09-10.json).
- Source reviewed: `8cb264a24ef997d635210bc5d0152363f78f8486` in the backend repository. Deployed source revision is unverified; source and live specification differ.

## Reproduction, actual result, and expected result

1. Start the local stack with the environment above.
2. Execute the reproduction below; for documentation defects, compare the indicated schema with the response.
3. Inspect the status/body and compare with the stated expectation. The recorded result is from the original session, not a new retest.

```sh
python3 -c 'import json; print(json.dumps({"username":"x"*256,"password":"xxxx"}))' | \
  curl -i http://localhost:8081/api/v1/users/signin \
    -H 'Content-Type: application/json' --data-binary @-
```

Actual: `400 {"username":"Minimum username length: 4 characters"}`. Password has the same problem. Expected: identify the 255-character maximum or the allowed 4–255 range. Reproduced in the follow-up run. Source uses one minimum-only message for both `@Size` limits.

## Impact assessment

Callers exceeding the username or password maximum receive a message about the minimum. The request is still rejected with 400, and the documented maximum provides a workaround. No acceptance of overlong credentials or failure for valid lengths was demonstrated by this finding. The impact is confusing corrective guidance for an invalid request.

## Severity rationale and decision

The maximum-length boundary is enforced, but the message directs callers toward the minimum instead. Valid-length login is not shown to fail, and consulting the documented maximum resolves the input problem. The consequence is limited to corrective guidance.

**Severity:** L

**Severity reviewed on:** 2026-09-11, using the recorded evidence and its limits. No new live reproduction or fixed-build verification was performed for this review.

**Reassessed on:** 2026-09-10. Evidence review of the recorded exploration and saved specification; no new runtime session or fixed-build retest was performed. Previous severity: L. This reassessment does not mark the defect fixed.

## Evidence and investigation notes

Discovered during sign-in exploration on 2026-09-10. The reproduction and sanitized observations above are sufficient to investigate without the ignored scratch files. Any suspected cause above remains a hypothesis until checked against the deployed build.

## Acceptance criteria and retest

- [ ] Both username and password over 255 characters receive a maximum/range message.
- [ ] Lengths 3, 4, 255, and 256 still enforce the documented range.
- [ ] Link a regression test or record why verification remains manual.

**Retested on/build:** Not yet retested after a fix.  
**Retest evidence:** None; this filing adds documentation only.

## Side effects / cleanup

The shown failing requests returned no login tokens. No account edits or cleanup actions were performed for this finding.

## Supervisor reassessment — 2026-09-10

Gateway: `http://localhost:8081`; deployed backend image: `slawekradzyminski/backend:3.7.16`. The live OpenAPI was compared structurally with the retained September 10 snapshot and matched exactly. Local source HEAD is `8cb264a24ef997d635210bc5d0152363f78f8486`; deployed source revision remains unverified. This is a current-build reproduction/evidence review, not a fixed-build verification.

A 256-character username with an otherwise ordinary password returned 400 and Minimum username length: 4 characters. The misleading guidance is reproduced; retain Low.
