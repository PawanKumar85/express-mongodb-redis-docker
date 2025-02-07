import { createClient } from "redis";
import dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || 6379,
  },
});

redisClient.on("error", (err) =>
  console.error(chalk.bgRed("Redis Error:", err.message))
);

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log(chalk.bgYellow("🚀 Connected to Redis"));
  } catch (error) {
    console.error(chalk.bgRed("Redis Connection Error:", error));
    process.exit(1);
  }
};

connectRedis();

export default redisClient;
