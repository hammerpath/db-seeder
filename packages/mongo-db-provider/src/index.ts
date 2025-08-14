import { createApp, startServer } from "db-seeder-server";
import config from "./config/config";
import { DocumentDbProvider } from "db-seeder-server";
import MongoDbRepository from "./repositories/MongoDbRepository";

(async () => {
  const { serverHost, serverPort, db, password, user, dbPort, dbHost } =
    config;

  const connectionString = `mongodb://${user}:${password}@${dbHost}:${dbPort}/${db}?authSource=admin`;

  const app = createApp();

  startServer(
    {
      app,
      registerProvider: () => new DocumentDbProvider(
        new MongoDbRepository(connectionString, db)
      ),
      port: serverPort,
      host: serverHost,
      db
    });
})();
