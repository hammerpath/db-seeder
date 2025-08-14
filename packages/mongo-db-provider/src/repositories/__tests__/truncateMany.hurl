# The schemas are defined in the test init_pg_tables.sql file

# Should succeed when inserting a user.
POST http://localhost:3000/seed/users
{
    "id": 1,
    "name": "John Doe"
}
HTTP 200

# Should succeed when inserting a post.
POST http://localhost:3000/seed/posts
{
    "id": 1,
    "title": "Test Post",
    "content": "Test Content"
}
HTTP 200

# Should succeed when truncating
POST http://localhost:3000/truncate
HTTP 200

# Users is empty
GET http://localhost:3000/users
HTTP 200
[]

# Posts is empty
GET http://localhost:3000/posts
HTTP 200
[]