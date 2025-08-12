import express, { json, Application, Request, Response } from "express";
import { RelationalDbProvider } from "./providers/RelationalDbProvider";

type BodyValidation = "Valid" | "Invalid" | "EmptyObjectOrArray";

function isObjectOrArray(value: any): boolean {
  return typeof value === 'object' && value !== null;
}

function validateBody(body: any): BodyValidation {
  if (body == null) {
    return "Invalid";
  }
  if (Object.keys(body).length === 0) {
    return "EmptyObjectOrArray";
  }
  if (!isObjectOrArray(body)) {
    return "Invalid";
  }
  return "Valid";
}

export function createApp(): Application {
  const app = express();
  app.use(json());
  return app;
}

export async function startServer({app, registerProvider, port, host, db}: {app: Application, registerProvider: () => RelationalDbProvider, port: number, host: string, db: string}) {
  const provider = registerProvider();

  const connectionTest = await provider.testConnection();

  if (!connectionTest) {
    console.error(`DB Seeder server failed to connect to the ${db} database. Please make sure it's running.`);
    process.exit(1);
  }

  const tableNames = await provider.getTableNames();

  if(tableNames.length === 0) {
    console.error(`DB Seeder server failed to find any tables in the ${db} database. Please add tables and restart the server.`);
    process.exit(1);
  }

  tableNames.forEach((tableName: string) => {
    // Create seed endpoints based on the existing table names
    app.post(`/seed/${tableName}`, async (req: Request, res: Response) => {
      const bodyValidation = validateBody(req.body);

      if (bodyValidation !== "Valid") {
        res.status(400).send(`${bodyValidation}: ${JSON.stringify(req.body)}`);
        return;
      }
      await provider.insert(tableName, req.body);
      console.info(`Successfully seeded the ${tableName} endpoint with ${JSON.stringify(req.body)}`);
      res.send();
    });

    console.info(`POST /seed/${tableName} created.`);

    // Create truncate endpoints for single tables
    app.post(`/truncate/${tableName}`, async (req: Request, res: Response) => {
      const cascade = req.query.noCascade === undefined;
      const restartIdentity = req.query.noRestartIdentity === undefined;
      await provider.truncateTable(tableName, { cascade, restartIdentity });
      console.info(`Truncated the ${tableName} table`);
      res.send();
    });

    console.info(`POST /truncate/${tableName} created.`);
  });

  // Create a truncate endpoint that truncates all tables
  app.post("/truncate", async (req: Request, res: Response) => {
    const restartIdentity = req.query.noRestartIdentity === undefined;
    await provider.truncateTables({ restartIdentity });
    console.info(`Truncated all tables`);
    res.send();
  });

  console.info(`POST /truncate created.`);

  return new Promise((resolve, reject) => {
    const server = app.listen(port, host, () => {
      console.info("DB Seeder server is running.");
    });

    server.on('error', reject);
    server.on('close', resolve);
  });
}
