# DB Seeder Json File

Creates a server that can seed a json file with data. This is developed with e2e-tests in mind, and allows each test to set the file in a desired state.

## Setup with docker

The easiest way to use this service is most likely to use it with docker compose.

Start by creating an db.json file in the root of your project, and then create a docker-compose.yml file with the following content:

```yml
services:
  db-seeder-json-file:
   restart: always
   image: hammerpath/db-seeder-json-file:0.1
   ports:
      - "3000:3000"
   volumes:
      - ./db.json:/app/data/db.json
```

## Setup with npm

```bash
npm i db-seeder-json-file
```

In package.json add the following script:

```json
{
  "scripts": {
    "db-seeder": "db-seeder-json-file run"
  }
}
```

And run the server with:

```bash
npm run db-seeder
```

## Usage

The server will create endpoints for each key in the file. The endpoints are named after the keys.

### Populate the values

Send a POST request to http://localhost:3000/seed/{keyName} with the data you want to seed. An example would look like this:

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

### Remove the values from the key

Send a POST request to http://localhost:3000/truncate/{keyName} to remove the value(s) from the key.

```typescript
// Cypress
cy.request("POST", "http://localhost:3000/truncate/users");

// Playwright
await request.post("http://localhost:3000/truncate/users");
```

### Remove all values from the file

Send a POST request to http://localhost:3000/truncate to remove all values from the file.

```typescript
// Cypress
cy.request("POST", "http://localhost:3000/truncate");

// Playwright
await request.post("http://localhost:3000/truncate");
```
