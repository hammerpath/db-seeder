# Db Seeder

Db Seeder is a tool for seeding databases with data.

## Contribute

### Must haves

- [x] Create a cli which can run the server (db-seeder run)
- [x] Test the server in a real scenario
- [x] Run the server in the docker compose file
- [x] Handle db adapters using DI
- [x] Support foreign keys in relational databases
- [x] Write tests for the pg adapter
- [] Add postgres connection check when starting server
- [] Throw error when an array is used for foreign keys
- [x] Move postgres adapter to db-seeder and call it RelationalDbAdapter
- [x] Call adapters providers
- [x] Create docker image for db-seeder-postgres
- [] Fix /truncate endpoint to truncate foreign key tables first
- [] Create a smaller docker image
- [] Add delete/${tableName}/${id} endpoints
- [] Add patch/${tableName}/${id} endpoints


### Nice to haves

- [] Support composite primary keys
- [] Create colored console output from db-seeder-server
