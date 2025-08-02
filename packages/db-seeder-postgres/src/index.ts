import { registerAdapter, createApp, startServer } from "db-seeder";
import config from "./config/config";
import PostgresAdapter from "./PostgresAdapter";

const { db, password, user, dbPort, host, serverPort } =
  config;

const connectionString = `postgresql://${user}:${password}@${host}:${dbPort}/${db}`;

async function main() {
  try {
    console.log("Registering PostgresAdapter...");
    registerAdapter(new PostgresAdapter(connectionString));
    console.log("PostgresAdapter registered successfully");

    const app = createApp();
    await startServer(app);

    app.listen(serverPort, () => {
      console.log(`Server is running on ${host}:${serverPort}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
