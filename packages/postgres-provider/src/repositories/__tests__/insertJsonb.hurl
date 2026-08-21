# The schemas are defined in the test init_pg_tables.sql file.
# events has a jsonb `payload` column that must be stored as a literal value,
# not unwrapped as a related table.

# Reset test data.
POST http://localhost:3000/truncate
HTTP 200

# Should store an object payload as jsonb rather than treating it as a relation.
POST http://localhost:3000/seed/events
{
    "name": "created",
    "payload": { "foo": "bar", "count": 3 }
}
HTTP 200

# Should store an array payload as jsonb rather than unwrapping it as related rows.
POST http://localhost:3000/seed/events
{
    "name": "tagged",
    "payload": [ "a", "b" ]
}
HTTP 200

# Should preserve single quotes inside the payload.
POST http://localhost:3000/seed/events
{
    "name": "quoted",
    "payload": { "note": "O'Brien" }
}
HTTP 200

# Verify all three rows are present with their payloads intact.
GET http://localhost:3000/events
HTTP 200
[Asserts]
jsonpath "$" count == 3
jsonpath "$[0].payload.foo" == "bar"
jsonpath "$[0].payload.count" == 3
jsonpath "$[1].payload" count == 2
jsonpath "$[2].payload.note" == "O'Brien"
