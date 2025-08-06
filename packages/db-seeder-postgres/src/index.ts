import { createApp, startServer } from "db-seeder-server";
import config from "./config/config";
import { RelationalDbProviderImpl } from "db-seeder-server";
import PostgresRepository from "./repositories/PostgresRepository";

(async () => {
  const { db, password, user, dbPort, host, serverPort } =
    config;

  const connectionString = `postgresql://${user}:${password}@${host}:${dbPort}/${db}`;

  const app = createApp();

  startServer(
    {
      app,
      registerProvider: () => new RelationalDbProviderImpl(
        new PostgresRepository(connectionString)
      ),
      port: serverPort,
      host
    });
})();
