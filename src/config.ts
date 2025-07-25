import dotenv from "dotenv";

dotenv.config();

const config = {
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
};

export default config;
