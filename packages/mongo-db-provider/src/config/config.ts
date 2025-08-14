import dotenv from "dotenv";

dotenv.config();

interface Config {
  nodeEnv: string;
  serverHost: string;
  serverPort: number;
  dbPort: number;
  dbHost: string;
  db: string;
  user: string;
  password: string;
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || "development",
  serverHost: process.env.DB_SEEDER_HOST || "localhost",
  serverPort: Number(process.env.DB_SEEDER_PORT) || 3000,
  dbPort: Number(process.env.MONGO_PORT) || 27017,
  dbHost: process.env.MONGO_HOST || "localhost",
  db: process.env.MONGO_INITDB_DATABASE || "myDb",
  user: process.env.MONGO_INITDB_ROOT_USERNAME || "root",
  password: process.env.MONGO_INITDB_ROOT_PASSWORD || "example",
};

export default config;
