import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import {
  getCachedTasks,
  getCachedTaskById,
  updateCache,
} from "../services/redis.service.js";

export const createTask = async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.id;
  if (!title) {
    return res.status(400).json({ message: "Title is required." });
  }
  try {
    const existingTask = await Task.findOne({ title, user: userId });
    if (existingTask) {
      return res.status(400).json({ message: "Task title must be unique." });
    }
    const newTask = new Task({ title, description, user: userId });
    await newTask.save();

    // Update user's task list
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { tasks: newTask._id } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(201).json({
      message: "Task created successfully.",
      task: newTask,
    });

    return await updateCache(req.user.email, newTask, "add");
  } catch (error) {
    console.error("Create Task Error:", error.message);
    return res.status(500).json({ message: "Failed to create task." });
  }
};

export const getAllTasks = async (req, res) => {
  const userId = req.user?.id;
  try {
    const cachedTasks = await getCachedTasks(req.user.email);
    if (cachedTasks) {
      return res.status(200).json({ fromCache: true, tasks: cachedTasks });
    }
    const tasks = await Task.find({ user: userId }).select("-user");

    res.status(200).json({
      message: "Tasks fetched successfully.",
      total: tasks.length,
      tasks,
    });
    return await updateCache(req.user.email, tasks, "set");
  } catch (error) {
    console.error("Get All Tasks Error:", error.message);
    return res.status(500).json({ message: "Failed to fetch tasks." });
  }
};

export const getTaskById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const cachedTask = await getCachedTaskById(req.user.email, id);
    if (cachedTask) {
      return res.status(200).json({ fromCache: true, task: cachedTask });
    }
    const task = await Task.findOne({ _id: id, user: userId }).select("-user");
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }
    await updateCache(req.user.email, task, "update");
    return res.status(200).json({
      message: "Task fetched successfully.",
      task,
    });
  } catch (error) {
    console.error("Get Task By ID Error:", error.message);
    return res.status(500).json({ message: "Failed to fetch task." });
  }
};

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, description, isCompleted } = req.body;
  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, user: userId },
      { title, description, isCompleted },
      { new: true }
    ).select("-user");
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found." });
    }
    await updateCache(req.user.email, updatedTask, "update");
    return res.status(200).json({
      message: "Task updated successfully.",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update Task Error:", error.message);
    return res.status(500).json({ message: "Failed to update task." });
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  try {
    const deletedTask = await Task.findOneAndDelete({ _id: id, user: userId });
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found." });
    }
    await updateCache(req.user.email, id, "delete");
    return res.status(200).json({
      message: "Task deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Task Error:", error.message);
    return res.status(500).json({ message: "Failed to delete task." });
  }
};
