import redisClient from "../config/redis.js";
import dotenv from "dotenv";
dotenv.config();

const CACHE_EXPIRY = parseInt(process.env.CACHE_EXPIRY, 10) || 3600; // default to 1 hour

export const getCachedTasks = async (userId) => {
  const cacheKey = `user:${userId}:tasks`;
  const cachedData = await redisClient.get(cacheKey);
  return cachedData ? JSON.parse(cachedData) : null;
};

export const getCachedTaskById = async (userId, taskId) => {
  const cacheKey = `user:${userId}:task:${taskId}`;
  const cachedTask = await redisClient.get(cacheKey);
  return cachedTask ? JSON.parse(cachedTask) : null;
};

export const updateCache = async (userId, taskData, action) => {
  const taskListKey = `user:${userId}:tasks`;
  // Determine the task identifier: if taskData is an object, convert its _id to string; otherwise assume it's already a string.
  const taskId =
    typeof taskData === "object" && taskData._id
      ? taskData._id.toString()
      : taskData;
  const taskKey = `user:${userId}:task:${taskData.title}`;
  let cachedTasks = (await getCachedTasks(userId)) || [];

  // Ensure cachedTasks is an array of valid task objects (with _id)
  cachedTasks = Array.isArray(cachedTasks)
    ? cachedTasks.filter((t) => t && t._id)
    : [];

  switch (action) {
    case "add":
      cachedTasks.push(taskData);
      await redisClient.setEx(taskKey, CACHE_EXPIRY, JSON.stringify(taskData));
      break;
    case "update":
      cachedTasks = cachedTasks.map((t) => {
        if (t && t._id) {
          return t._id.toString() === taskData._id.toString() ? taskData : t;
        }
        return t;
      });
      await redisClient.setEx(taskKey, CACHE_EXPIRY, JSON.stringify(taskData));
      break;
    case "delete":
      cachedTasks = cachedTasks.filter(
        (t) => t && t._id && t._id.toString() !== taskId
      );
      await redisClient.del(taskKey);
      break;
    case "set":
      // Here, taskData is assumed to be an array of tasks.
      cachedTasks = taskData;
      break;
    default:
      break;
  }
  await redisClient.setEx(
    taskListKey,
    CACHE_EXPIRY,
    JSON.stringify(cachedTasks)
  );
};
