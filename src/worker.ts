import { Worker } from "bullmq";
import IORedis from "ioredis";
import config from "./config";
import { HermesClient } from "@pythnetwork/hermes-client";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { etherlinkTestnet } from "viem/chains";

const PYTH_ABI = [
  {
    type: "function",
    name: "getUpdateFee",
    inputs: [{ name: "updateData", type: "bytes[]", internalType: "bytes[]" }],
    outputs: [{ name: "feeAmount", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
];

const connection = new IORedis(config.redisUrl, { maxRetriesPerRequest: null });

interface BetJobData {
  betId: number | string;
}

const getClient = () => {
  return createWalletClient({
    account: privateKeyToAccount(config.PRIVATE_KEY as `0x${string}`),
    chain: etherlinkTestnet,
    transport: http(config.RPC_URL),
  });
};

const getPublicClient = () => {
  return createPublicClient({
    chain: etherlinkTestnet,
    transport: http(config.RPC_URL),
  });
};

const getLatestPriceUpdates = async () => {
  const client = getPublicClient();
  const connection = new HermesClient(config.HERMES_CLIENT_URL, {});
  const priceIds = [config.BTC_PRICE_FEED_ID];
  const priceUpdates = await connection.getLatestPriceUpdates(priceIds, {
    encoding: "hex",
  });
  const priceUpdateData = priceUpdates.binary.data.map((d: string) =>
    d.startsWith("0x") ? d : `0x${d}`
  );
  const dataFee = (await client.readContract({
    address: config.PYTH_CONTRACT_ADDRESS as `0x${string}`,
    abi: PYTH_ABI,
    functionName: "getUpdateFee",
    args: [priceUpdateData],
  })) as { fee: bigint };
  return {
    fee: dataFee?.fee || BigInt(0),
    priceUpdateData,
  };
};

const worker = new Worker<BetJobData>(
  config.QUEUE_NAME,
  async (job) => {
    console.log(job.data.betId);
    const data = await getLatestPriceUpdates();
    const client = getClient();
    await client.writeContract({
      address: config.FLASHBET_CONTRACT_ADDRESS as `0x${string}`,
      abi: config.FLASHBET_ABI,
      functionName: "resolveBet",
      args: [job.data.betId, data.priceUpdateData],
      value: data.fee,
    });
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job with ID ${job.id} completed successfully.`);
});

worker.on("failed", (job, err) => {
  console.error(`Job with ID ${job?.id} failed with error: ${err.message}`);
});
