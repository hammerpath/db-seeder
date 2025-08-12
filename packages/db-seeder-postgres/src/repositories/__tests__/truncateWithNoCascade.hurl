# The schemas are defined in the test init_pg_tables.sql file

# Reset test data.
POST http://localhost:3000/truncate
HTTP 200

# Should succeed when inserting a user.
POST http://localhost:3000/seed/users
{
    "name": "John Doe",
    "age": 30
}
HTTP 200

# Should fail since there is a foreign key constraint on the users table.
POST http://localhost:3000/truncate/users?noCascade
HTTP 500

# Should succeed when using cascade.
POST http://localhost:3000/truncate/users
HTTP 200