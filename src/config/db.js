import mongoose from "mongoose";
import dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(chalk.bgGreen("MongoDB connected successfully."));
  } catch (error) {
    console.error(chalk.bgRed("Error connecting to MongoDB:", error.message));
    process.exit(1);
  }
};

export default connectToDB;
