import { createApp, startServer } from "db-seeder";
import config from "./config/config";
import PostgresAdapter from "./PostgresAdapter";

const { db, password, user, dbPort, host, serverPort } =
  config;

const connectionString = `postgresql://${user}:${password}@${host}:${dbPort}/${db}`;

const app = createApp();

startServer(
  {
    app,
    registerAdapter: () => new PostgresAdapter(connectionString),
    port: serverPort,
    host
  });
