import { createClient } from "redis";

declare global {
  // eslint-disable-next-line no-var
  var _redisClient: ReturnType<typeof createClient> | undefined;
}

function getClient() {
  if (!process.env.REDIS_URL) throw new Error("REDIS_URL not configured");
  if (!global._redisClient) {
    global._redisClient = createClient({ url: process.env.REDIS_URL });
    global._redisClient.on("error", (err) =>
      console.error("[redis] client error:", err)
    );
  }
  return global._redisClient;
}

export async function getRedis() {
  const client = getClient();
  if (!client.isOpen) await client.connect();
  return client;
}
