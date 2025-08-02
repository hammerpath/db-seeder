import express, { json, Application, Request, Response } from "express";
import { getAdapter } from './exports';

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

export async function startServer(app: Application = createApp()): Promise<Application> {
  // Get the registered adapter
  const adapter = getAdapter();

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

  return app;
}
