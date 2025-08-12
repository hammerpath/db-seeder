# The schemas are defined in the test init_pg_tables.sql file

# Reset test data.
POST http://localhost:3000/truncate
HTTP 200

# Should succeed when inserting a user.
POST http://localhost:3000/seed/users
{
    "id": 1,
    "name": "John Doe",
    "age": 30
}
HTTP 200

# Should succeed when truncating the users table.
POST http://localhost:3000/truncate/users?noRestartIdentity
HTTP 200

# Should fail when inserting a user with the same id.
POST http://localhost:3000/seed/users
{
    "id": 1,
    "name": "John Doe",
    "age": 30
}
HTTP 500