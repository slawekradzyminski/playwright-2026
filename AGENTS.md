API tests:
- use given (test setup) when (tested action) then (assertions)
- order tests by response code ascending (200 -> 400 -> 401 -> ...)
- store http client logic in http folder
- API is documented here http://localhost:8081/v3/api-docs (use curl to get it)