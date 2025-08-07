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
  dbPort: Number(process.env.POSTGRES_PORT) || 5432,
  dbHost: process.env.POSTGRES_HOST || "localhost",
  db: process.env.POSTGRES_DB || "myDb",
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "mysecretpassword",
};

export default config;
