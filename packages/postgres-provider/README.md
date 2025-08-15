# DB Seeder Postgres

Creates a server that can seed a postgres database with data. This is developed with e2e-tests in mind, and allows each test to set the database in a desired state.

## Setup with docker

The easiest way to use this service is most likely to use it with docker compose.

Start by creating a `.env` file with the following content:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=myDb
```

And then create a `docker-compose.yml` file with the following content:

```yml
services:
  postgres:
    restart: always
    image: postgres:17-alpine
    env_file:
      - .env
    ports:
      - 5432:5432
    volumes:
      - ./pg-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5

  db-seeder-postgres:
   restart: always
   image: hammerpath/db-seeder-postgres:0.1
   ports:
      - "3000:3000"
   env_file:
      - .env
   environment:
      - POSTGRES_HOST=postgres
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
   depends_on:
      postgres:
        condition: service_healthy
```

The database needs to be initialized with tables before using this service. If it's empty, this can be done by creating a `init_pg_tables.sql` file in the root of your project with the following content:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
```

And add it to the `docker-compose.yml` file:

```yml
services:
  postgres:
    # --- Other properties here ---
    volumes:
      - ./init_pg_tables.sql:/docker-entrypoint-initdb.d/init_pg_tables.sql
```

And then run `docker compose up`.

Now you can call the [auto generated endpoints for each table](#usage).

## Setup with npm

```bash
npm i db-seeder-postgres
```

In package.json add the following script:

```json
{
  "scripts": {
    "db-seeder": "db-seeder-postgres run"
  }
}
```

And run the server with:

```bash
npm run db-seeder
```

## Usage

The server will create endpoints for each table in the database. The endpoints are named after the table name.

### Seed a table

Send a POST request to http://localhost:3000/seed/{tableName} with the data you want to seed. An example would look like this:

```typescript
const users = [
    {
        id: 1,
        name: "John Doe"
    },
    {
        id: 2,
        name: "Jane Doe"
    }
];
// Cypress
cy.request("POST", "http://localhost:3000/seed/users", users);

// Playwright
await request.post("http://localhost:3000/seed/users", {
    data: users
});
```

It is also possible to seed relational tables using the same request. Just name the key after the related table name.

```typescript
const users = [
    {
        id: 1,
        name: "John Doe",
        address: {
            id: 1,
            street: "123 Main St",
            city: "Anytown"
        }
    },
    {
        id: 2,
        name: "Jane Doe",
        address: {
            id: 2,
            street: "456 Elm St",
            city: "Othertown"
        }
    }
];
```

### Remove all rows from a table

Send a POST request to http://localhost:3000/truncate/{tableName} to remove all rows from the table.

```typescript
// Cypress
cy.request("POST", "http://localhost:3000/truncate/users");

// Playwright
await request.post("http://localhost:3000/truncate/users");
```

### Remove all rows from all tables

Send a POST request to http://localhost:3000/truncate to remove all rows from all tables.

```typescript
// Cypress
cy.request("POST", "http://localhost:3000/truncate");

// Playwright
await request.post("http://localhost:3000/truncate");
```

### Truncate Options

You can pass options to the truncate endpoint using query parameters:

- noCascade
- noRestartIdentity

For example:

```typescript
// Cypress
cy.request("POST", "http://localhost:3000/truncate/users?noCascade&noRestartIdentity");

// Playwright
await request.post("http://localhost:3000/truncate/users?noCascade&noRestartIdentity");
```
