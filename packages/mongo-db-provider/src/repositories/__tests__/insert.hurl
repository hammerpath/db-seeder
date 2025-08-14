# The schemas are defined in the test init_pg_tables.sql file

# Should succeed when inserting a user.
POST http://localhost:3000/seed/users
{
    "id": 1,
    "name": "John Doe"
}
HTTP 200

# The user is inserted.
GET http://localhost:3000/users
HTTP 200
[Asserts]
jsonpath "$[0].id" == 1
jsonpath "$[0].name" == "John Doe"

# Clean up test data.
POST http://localhost:3000/truncate
HTTP 200