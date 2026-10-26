API tests:
- use given (test setup) when (tested action) then (assertions)
- order tests by response code ascending (200 -> 400 -> 401 -> ...)
- store http client logic in http folder
- API is documented here http://localhost:8081/v3/api-docs (use curl to get it)

Bug reports:
- Log every discovered bug in bugs/ using bugs/TEMPLATE.md and the next available BUG-NNNN identifier; update an existing report for duplicates. Use English.
