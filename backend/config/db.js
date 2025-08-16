import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbConnect = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      console.log("Check env or connection string");
    }

    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    mongoose.connection.on("err", () => {
      console.log("MongoDB connection error");
    });
    await mongoose.connect(MONGODB_URI);
  } catch (error) {
    console.log("MongoDB connection failed");
  }
};

export default dbConnect
