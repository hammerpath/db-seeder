import { createApp, startServer } from "db-seeder-server";
import config from "./config/config";
import PostgresAdapter from "./PostgresAdapter";
import PostgresRepository from "./repositories/PostgresRepository";

const { db, password, user, dbPort, host, serverPort } =
  config;

const connectionString = `postgresql://${user}:${password}@${host}:${dbPort}/${db}`;

const app = createApp();

startServer(
  {
    app,
    registerAdapter: () => new PostgresAdapter(
      new PostgresRepository(connectionString)
    ),
    port: serverPort,
    host
  });
