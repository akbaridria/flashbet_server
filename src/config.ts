import dotenv from "dotenv";
import abi from "./abi.json";

dotenv.config();

const config = {
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  QUEUE_NAME: "betQueue",
  FLASHBET_ABI: abi,
  HERMES_CLIENT_URL: "https://hermes.pyth.network",
  BTC_PRICE_FEED_ID:
    "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  PYTH_CONTRACT_ADDRESS: "0x2880aB155794e7179c9eE2e38200202908C17B43",
  RPC_URL: "https://node.ghostnet.etherlink.com",
  PRIVATE_KEY: process.env.PRIVATE_KEY || "",
  FLASHBET_CONTRACT_ADDRESS: process.env.FLASHBET_CONTRACT_ADDRESS,
};

export default config;
