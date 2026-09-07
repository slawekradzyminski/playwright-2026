# BUG-003: DELETE product 404 does not return documented ErrorDto

Observed 2026-09-07 on http://localhost:8081.

As admin, create a product, delete it (204), then DELETE the same ID again.
Expected: 404 with the documented ErrorDto (`{"message":"Product not found"}`).
Actual: 404 with an empty body. GET and PUT return the JSON message for missing products.

Regression coverage is left to the developer handling the Jira issue, per the project workflow.
