import express, { json } from "express";
import config from "./config/config";
import PostgresAdapter from "./adapters/PostgresAdapter";

const app = express();

app.use(json());

const connectionString = `postgresql://${config.postgrestUser}:${config.postgrestPassword}@localhost:5432/${config.postgrestDb}`;

const adapter = new PostgresAdapter(connectionString);

// TODO - fix top level await
(async () => {
  const tableNames = await adapter.getTableNames();

  tableNames.forEach((tableName) => {
    // Create seed endpoints based on the existing table names
    app.post(`/seed/${tableName}`, async (req, res) => {

      const bodyValidation = validateBody(req.body);

      if(bodyValidation != "Valid"){
        res.statusCode = 400;
        res.send(`${bodyValidation}: ${JSON.stringify(req.body)}`);
        return;
      }
      await adapter.insert(tableName, req.body);
      res.send();
    });

    // Create truncate endpoints for single tables
    app.post(`/truncate/${tableName}`, async (req, res) => {
      await adapter.truncateTable(tableName);
      res.send();
    });

    // app.put(`/update/${tableName}/:primaryKey/:id`, async (req, res) => {
    //   const {primaryKey, id} = req.params
    // });
  });
})();

const validateBody = (body: any) : BodyValidation => {
  // TODO - can this occur?
  if(body == null){
    return "Invalid";
  }
  if(Object.keys(body).length === 0){
    return "EmptyObjectOrArray";
  }
  // TODO - is this even needed?
  if(!isObjectOrArray(body)){
    return "NotObjectOrArray";
  }

  // TODO - validate that all required values are present.

  return "Valid";
}

type BodyValidation = "Valid" | "Invalid" | "EmptyObjectOrArray" | "NotObjectOrArray";

const isObjectOrArray = (value: any) => typeof value === 'object' && value !== null;

// Create a truncate endpoint that truncates all tables
app.post("/truncate", async (req, res) => {
  await adapter.truncateTables();
  res.send();
});

app.listen(config.port, () => {
  console.log(`db-seeder listening on port ${config.port}`);
});
