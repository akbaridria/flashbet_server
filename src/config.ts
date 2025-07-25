import dotenv from "dotenv";
import abi from "./abi.json";

dotenv.config();

const config = {
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  QUEUE_NAME: "betQueue",
  FLASHBET_ABI: abi,
};

export default config;
