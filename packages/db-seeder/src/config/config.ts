import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  postgrestDb: string;
  postgrestUser: string;
  postgrestPassword: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  postgrestDb: process.env.POSTGRES_DB || "myDb",
  postgrestUser: process.env.POSTGRES_USER || "user",
  postgrestPassword: process.env.POSTGRES_PASSWORD || "abc123",
};

export default config;
