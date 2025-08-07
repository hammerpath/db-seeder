import { createApp, startServer } from "db-seeder-server";
import config from "./config/config";
import { RelationalDbProviderImpl } from "db-seeder-server";
import PostgresRepository from "./repositories/PostgresRepository";

(async () => {
  const { serverHost, serverPort, db, password, user, dbPort, dbHost } =
    config;

  const connectionString = `postgresql://${user}:${password}@${dbHost}:${dbPort}/${db}`;

  const app = createApp();

  startServer(
    {
      app,
      registerProvider: () => new RelationalDbProviderImpl(
        new PostgresRepository(connectionString)
      ),
      port: serverPort,
      host: serverHost,
      db
    });
})();
