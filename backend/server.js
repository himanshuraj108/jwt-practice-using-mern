import express from "express";
import dotenv from "dotenv";
import dbConnect from "./config/db.js";
import cors from "cors";
import bcryptjs from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import User from "./models/user.model.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
await dbConnect();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

// API Testing
app.get("/", (req, res) => {
  res.send("API working");
});

// Middleware for protected routes
const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized user",
      error: true,
      success: false,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Forbidden",
      error: true,
      success: false,
    });
  }
};

// Register User
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Fields are required",
        error: true,
        success: false,
      });
    }

    const findUser = await User.findOne({ email });

    if (findUser) {
      return res.status(401).json({
        message: "User already exists",
        error: true,
        success: false,
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Please enter valid email address",
        error: true,
        success: false,
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
        error: true,
        success: false,
      });
    }

    const hashPassword = await bcryptjs.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashPassword,
    });

    await newUser.save();

    return res.status(200).json({
      message: "Register successful",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error in Register",
      error: true,
      success: false,
    });
  }
});

// Login User
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Fields are required",
        error: true,
        success: false,
      });
    }

    const findUser = await User.findOne({ email });

    if (!findUser) {
      return res.status(401).json({
        message: "User does not exist",
        error: true,
        success: false,
      });
    }

    const comparePassword = await bcryptjs.compare(password, findUser.password);

    if (!comparePassword) {
      return res.status(401).json({
        message: "Password is incorrect",
        error: true,
        success: false,
      });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error on login",
      error: true,
      success: false,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
});
