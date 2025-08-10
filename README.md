# Db Seeder

Db Seeder is a tool for seeding databases with data.

## Running locally

```bash
npm i --workspaces
```

Create an .env file in the root directory or the directory of the chosen provider. For db-seeder-postgres it should look like this:

```env
POSTGRES_PORT=5432
POSTGRES_HOST=localhost
POSTGRES_PASSWORD=postgres
POSTGRES_USER=postgres
POSTGRES_DB=myDb
```

Go to the chosen provider. For example:

```bash
cd packages/db-seeder-postgres
```

And run the server with:

```bash
npm run dev
```

## Contribute

### Must haves

- [x] Create a cli which can run the server (db-seeder run)
- [x] Test the server in a real scenario
- [x] Run the server in the docker compose file
- [x] Handle db adapters using DI
- [x] Support foreign keys in relational databases
- [x] Write tests for the pg adapter
- [x] Add postgres connection check when starting server
- [] Throw error when an array is used for foreign keys
- [x] Move postgres adapter to db-seeder and call it RelationalDbAdapter
- [x] Call adapters providers
- [x] Create docker image for db-seeder-postgres
- [x] Fix /truncate endpoint to truncate foreign key tables first
- [x] Create a smaller docker image
- [] Add delete/${tableName}/${id} endpoints
- [] Add patch/${tableName}/${id} endpoints
- [] Docker compose starts db-seeder-postgres too early when db doesn't exist (should add try again logic)
- [] Expose type for seeding endpoints
- [] Implement graceful exit of docker image
- [] Add support for a document database
- [] Add support for a single json file

### Nice to haves

- [] Support composite primary keys
- [] Create colored console output from db-seeder-server
