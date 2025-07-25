import { Worker } from "bullmq";
import IORedis from "ioredis";
import config from "./config";

const connection = new IORedis(config.redisUrl, { maxRetriesPerRequest: null });

interface BetJobData {
  betId: number | string;
}

const worker = new Worker<BetJobData>(
  config.QUEUE_NAME,
  async (job) => {
    console.log(job.data.betId);
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job with ID ${job.id} completed successfully.`);
});

worker.on("failed", (job, err) => {
  console.error(`Job with ID ${job?.id} failed with error: ${err.message}`);
});
