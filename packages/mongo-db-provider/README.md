# DB Seeder Mongo Db

Creates a server that can seed a mongo db with data. This is developed with e2e-tests in mind, and allows each test to set the file in a desired state.

## Setup with docker

The easiest way to use this service is most likely to use it with docker compose.

Start by creating an .env file, and then create a docker-compose.yml file with the following content:

```yml
services:
  mongo:
    restart: always
    image: mongo:8
    env_file:
      - .env
    ports:
      - 27017:27017
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
      - MONGO_INITDB_DATABASE=${MONGO_INITDB_DATABASE}
    healthcheck:
      test: ["CMD-SHELL", "mongod --version"]
      interval: 5s
      timeout: 5s
      retries: 5

  db-seeder-mongo-db:
   restart: always
   image: hammerpath/db-seeder-mongo-db:0.1
   ports:
      - "3000:3000"
   env_file:
      - .env
   environment:
      - MONGO_HOST=mongo
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
      - MONGO_INITDB_DATABASE=${MONGO_INITDB_DATABASE}
   depends_on:
      mongo:
        condition: service_healthy  
```

## Setup with npm

```bash
npm i db-seeder-mongo-db
```

In package.json add the following script:

```json
{
  "scripts": {
    "db-seeder": "db-seeder-mongo-db run"
  }
}
```

And run the server with:

```bash
npm run db-seeder
```

## Usage

The server will create endpoints for each collection in the database. The endpoints are named after the collections.

### Populate the values

Send a POST request to http://localhost:3000/seed/{collectionName} with the data you want to seed. An example would look like this:

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

### Remove the values from the collection

Send a POST request to http://localhost:3000/truncate/{collectionName} to remove the value(s) from the collection.

```typescript
// Cypress
cy.request("POST", "http://localhost:3000/truncate/users");

// Playwright
await request.post("http://localhost:3000/truncate/users");
```

### Remove all values from the database

Send a POST request to http://localhost:3000/truncate to remove all values from the database.

```typescript
// Cypress
cy.request("POST", "http://localhost:3000/truncate");

// Playwright
await request.post("http://localhost:3000/truncate");
```
