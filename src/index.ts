import { Queue } from "bullmq";
import fastify from "fastify";
import config from "./config";

const server = fastify();

const betQueue = new Queue("betQueue", {
  connection: {
    url: config.redisUrl,
  },
});

server.get("/", async () => {
  return "pong\n";
});

server.post("/add-job", async (request, reply) => {
  const { betId } = request.body as { betId: string };
  if (!betId) {
    reply.status(400).send({ error: "Bet ID is required" });
    return;
  }
  betQueue.add(`betid-${betId}`, { betId });
  reply.status(201).send({ message: "Job added successfully", betId });
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
