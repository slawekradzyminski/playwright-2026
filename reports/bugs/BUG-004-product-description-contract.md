# BUG-004: Create product rejects documented empty description

Observed 2026-09-07 on http://localhost:8081.

As admin, POST /api/v1/products with name="abc", description="", price=0.01,
stockQuantity=0, category="Tests", imageUrl="".
Expected from ProductCreateDto: 201 (description minLength is 0 and the property is present).
Actual: 400, `{"description":"Product description is required"}`.
PUT accepts an empty description. Align the implementation and OpenAPI contract.

Regression coverage is left to the developer handling the Jira issue, per the project workflow.
