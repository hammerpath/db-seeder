import dotenv from "dotenv";

dotenv.config();

interface Config {
  nodeEnv: string;
  serverHost: string;
  serverPort: number;
  filePath: string;
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || "development",
  serverHost: process.env.DB_SEEDER_HOST || "localhost",
  serverPort: Number(process.env.DB_SEEDER_PORT) || 3000,
  filePath: process.env.DB_SEEDER_FILE_PATH || "./db-seeder-data/db.json",
};

export default config;
