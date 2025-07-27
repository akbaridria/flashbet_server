import { Queue } from "bullmq";
import fastify from "fastify";
import config from "./config";

const server = fastify();

const betQueue = new Queue(config.QUEUE_NAME, {
  connection: {
    url: config.redisUrl,
  },
});

server.get("/", async () => {
  return "pong\n";
});

server.post("/add-job", async (request, reply) => {
  const { betId, expiryTime } = request.body as {
    betId: string;
    expiryTime: number;
  };
  if (!betId) {
    reply.status(400).send({ error: "Bet ID is required" });
    return;
  }
  const now = Math.floor(Date.now() / 1000);
  const delayMs = Math.max((expiryTime - now) * 1000, 0);

  await betQueue.add(
    `betid-${betId}`,
    { betId, expiryTime },
    {
      delay: delayMs,
      attempts: 10,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
  reply.status(201).send({ message: "Job added successfully", betId });
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
