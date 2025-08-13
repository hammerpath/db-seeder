# The schemas are defined in the test init_pg_tables.sql file

# Reset test data.
POST http://localhost:3000/truncate
HTTP 200

# Should succeed when inserting a user.
POST http://localhost:3000/seed/users
{
    "id": 1,
    "name": "John Doe"
}
HTTP 200

# Should succeed when truncating
POST http://localhost:3000/truncate/users
HTTP 200