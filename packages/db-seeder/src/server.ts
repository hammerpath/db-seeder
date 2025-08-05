import express, { json, Application, Request, Response } from "express";
import { DbAdapter } from "./adapters/DbAdapter";

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

export async function startServer({app, registerAdapter, port, host}: {app: Application, registerAdapter: () => DbAdapter, port: number, host: string}) {
  const adapter = registerAdapter();

  const connectionTest = await adapter.testConnection();

  if (!connectionTest) {
    console.error("DB Seeder server failed to connect to the database. Please make sure it's running.");
    process.exit(1);
  }

  const tableNames = await adapter.getTableNames();

  tableNames.forEach((tableName: string) => {
    // Create seed endpoints based on the existing table names
    app.post(`/seed/${tableName}`, async (req: Request, res: Response) => {
      const bodyValidation = validateBody(req.body);

      if (bodyValidation !== "Valid") {
        res.status(400).send(`${bodyValidation}: ${JSON.stringify(req.body)}`);
        return;
      }
      await adapter.insert(tableName, req.body);
      res.send();
    });

    // Create truncate endpoints for single tables
    app.post(`/truncate/${tableName}`, async (req: Request, res: Response) => {
      await adapter.truncateTable(tableName);
      res.send();
    });
  });

  // Create a truncate endpoint that truncates all tables
  app.post("/truncate", async (req: Request, res: Response) => {
    await adapter.truncateTables();
    res.send();
  });

  app.listen(port, () => {
    console.log(`DB Seeder server is running on ${host}:${port}`);
  });
}
