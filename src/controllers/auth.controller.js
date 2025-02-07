import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import chalk from "chalk";
import redisClient from "../config/redis.js";

dotenv.config();

const generateToken = (data) => {
  const payload = {
    id: data._id,
    email: data.email,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

export const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;
  if (!userName || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists." });
    }
    const user = new User({ userName, email, password });
    await user.save();

    return res.status(201).json({
      message: "User registered successfully.",
      user,
    });
  } catch (error) {
    console.error(chalk.red("Registration Error:", error.message));
    return res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const token = generateToken(user);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: "Strict",
    };

    // Store token in Redis with 1-day expiry (86400 seconds)
    await redisClient.setEx(`user:${user.email}`, 86400, token);

    return res
      .status(200)
      .cookie("token", token, cookieOptions)
      .json({ message: "User logged in successfully.", token });
  } catch (error) {
    console.error(chalk.red("Login Error:", error.message));
    return res.status(500).json({ error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not logged in." });
  }
  try {
    const pattern = `user:${req.user.email}*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    return res.status(200).json({
      message: "User logged out successfully.",
    });
  } catch (error) {
    console.error(chalk.red("Logout Error:", error.message));
    return res.status(500).json({ error: error.message });
  }
};
