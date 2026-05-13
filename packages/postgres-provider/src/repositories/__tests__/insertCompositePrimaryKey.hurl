# The schemas are defined in the test init_pg_tables.sql file.
# post_revisions has a composite primary key: (post_id, revision_number).

# Reset test data.
POST http://localhost:3000/truncate
HTTP 200

# Seed prerequisites: a user and a post so the FK from post_revisions resolves.
POST http://localhost:3000/seed/users
{
    "name": "John Doe",
    "age": 30
}
HTTP 200

POST http://localhost:3000/seed/posts
{
    "title": "Hello",
    "content": "World",
    "user_id": 1
}
HTTP 200

# Should succeed when inserting a single row into a composite-PK table.
POST http://localhost:3000/seed/post_revisions
{
    "post_id": 1,
    "revision_number": 1,
    "content": "First draft"
}
HTTP 200

# Should succeed when inserting multiple rows sharing the same post_id
# but with distinct revision_numbers (i.e. the full composite key differs).
POST http://localhost:3000/seed/post_revisions
[
    { "post_id": 1, "revision_number": 2, "content": "Second draft" },
    { "post_id": 1, "revision_number": 3, "content": "Final" }
]
HTTP 200

# Verify all three rows are present.
GET http://localhost:3000/post_revisions
HTTP 200
[Asserts]
jsonpath "$" count == 3
