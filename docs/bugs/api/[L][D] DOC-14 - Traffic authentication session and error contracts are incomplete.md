# [D] Traffic endpoints — secured-profile requirements and error bodies are missing

**ID:** DOC-14
**Status:** Open

## Environment and evidence

Explored before automation and rechecked on 2026-09-10 at `http://localhost:8081`, backend `slawekradzyminski/backend:3.7.16`. The live specification matches the retained [snapshot](../../exploratory-testing/openapi-2026-09-10.json); deployed source revision is unverified. This observation concerns the configured secured profile, not an untested legacy-public configuration.

All three GET operations (`/traffic/info`, `/traffic/logs`, `/traffic/logs/{correlationId}`, below `/api/v1`) return 401 JSON `{"message":"Unauthorized"}` without a token. With a valid admin or client token, omitting X-Client-Session-Id returns 400 JSON `{"error":"A valid X-Client-Session-Id header is required"}`. A unique header such as `traffic-example-1234567890` permits successful info and scoped log reads. Short/invalid headers are rejected.

Neither global nor per-operation security requirements describe Bearer authentication. The session header is optional without explaining the secured-profile requirement or accepted format. Info documents only 200; log list omits 401 and assigns a page DTO to 400. Correlation lookup omits 400/401 and advertises TrafficLogEntryDto for 404, although unknown and different-session lookups return an empty 404 body.

Independent pagination follow-up confirmed `size=0 → pageSize=1` and `size=101 → pageSize=100`. The initial contradictory probe was an inspection error and is not a reported functional defect.

## Impact assessment

Consumers receive incomplete setup and error-handling guidance; usable requests require both credentials and a valid session header in this profile. Runtime rejection and tested session scoping work. Error messages provide a workaround, and no consumer outage or per-user secrecy guarantee was demonstrated.

## Severity rationale and decision

Traffic clients lack complete credential/session-header setup and error guidance. Runtime session scoping and rejection worked, and observed error messages provide a recovery path. The evidence supports integration friction, not a consumer outage or violation of a demonstrated secrecy requirement.

**Severity:** L

**Severity reviewed on:** 2026-09-11, using the recorded evidence and its limits. No new live reproduction or fixed-build verification was performed for this review.

## Correction and retest

Describe profile-dependent Bearer/session requirements, accepted session format, size clamping, error models and empty 404 responses. Retest secured behavior and explicitly verify any supported legacy-public mode before describing it as tested. Session-header scoping is not evidence that logs remain private if users share the same session identifier. WebSocket behavior is outside this HTTP suite.
