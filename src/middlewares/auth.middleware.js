import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      console.log(chalk.yellow("No token provided"));
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          console.log(chalk.yellow("Token expired"));
          return res
            .status(401)
            .json({ message: "Token expired. Please log in again." });
        }
        return res.status(403).json({ message: "Invalid token." });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error(chalk.bgRed("Authentication Error:", error));
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
