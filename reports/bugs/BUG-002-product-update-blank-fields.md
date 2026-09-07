# BUG-002: Product update accepts blank catalog fields

Observed 2026-09-07 on http://localhost:8081 after admin login.

1. POST /api/v1/products with a valid, uniquely named product.
2. PUT /api/v1/products/{id} with `{"name":"   "}` or `{"category":""}`.
3. Read the product and delete it afterward.

Actual: 200; blank values are stored. Creation rejects the same values with 400.
Expected: 400 and unchanged product, preserving the nonblank creation invariants.
This is a validation consistency issue; ProductUpdateDto currently omits the nonblank constraints too, so product requirements should confirm the intended update rule.

Regression coverage is left to the developer handling the Jira issue, per the project workflow.
