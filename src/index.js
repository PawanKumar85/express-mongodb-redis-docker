import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectToDB from "./config/db.js";

// Routes
import authRouter from "./routes/user.routes.js";
import taskRouter from "./routes/task.routes.js";

dotenv.config();

const app = express();

// Connect to the database
connectToDB();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/users", authRouter);
app.use("/api/task", taskRouter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
