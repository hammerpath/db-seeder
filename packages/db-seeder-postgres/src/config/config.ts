import dotenv from "dotenv";

dotenv.config();

interface Config {
  serverPort: number;
  dbPort: number;
  nodeEnv: string;
  host: string;
  db: string;
  user: string;
  password: string;
}

const config: Config = {
  serverPort: Number(process.env.DB_SEEDER_PORT) || 3000,
  dbPort: Number(process.env.POSTGRES_PORT) || 5432,
  nodeEnv: process.env.NODE_ENV || "development",
  host: process.env.POSTGRES_HOST || "localhost",
  db: process.env.POSTGRES_DB || "myDb",
  user: process.env.POSTGRES_USER || "user",
  password: process.env.POSTGRES_PASSWORD || "abc123",
};

export default config;
