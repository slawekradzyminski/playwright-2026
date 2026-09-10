- use English
- use given (test setup), when (tested action), then (assertions)

# API test rules
- create http clients for each endpoint
- each endpoint should be tested in separate test file
- order tests by status code ascending (200 -> 400 -> ...)
- make sure tests keep passing - `npm run test:api`
- before automating given tests perform exploratory testing session, see docs/
- initialize clients in beforeEach
