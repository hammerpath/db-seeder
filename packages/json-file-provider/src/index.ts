import { createApp, DocumentDbProvider, startServer } from "db-seeder-server";
import config from "./config/config"
import JsonFileRepository from "./repositories/JsonFileRepository";

(async () => {
  const { serverHost, serverPort, filePath } =
    config;

  const app = createApp();

  startServer(
    {
      app,
      registerProvider: () => new DocumentDbProvider(
        new JsonFileRepository(filePath)
      ),
      port: serverPort,
      host: serverHost,
      db: filePath
    });
})();
