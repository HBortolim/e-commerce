import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { inject, errorHandler } from "express-custom-error";
import logger from "./utils/logger";
import router from "./routes/router";
import authRoutes from "./routes/authRoutes";
import helloRoutes from "./routes/helloRoutes";
import session from "express-session";
import passport from "passport";

// Patches
inject(); // Patch express in order to use async / await syntax

const app = express();

// Configure Express App Instance
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Configure custom logger middleware
app.use(logger.dev, logger.combined);

app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors());
app.use(helmet());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// This middleware adds the json header to every response
app.use("*", (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

// Assign Routes
app.use("/", router);
app.use("/auth", authRoutes);
app.use("/hello", helloRoutes);

// Handle errors
app.use(errorHandler());

// Handle not valid route
app.use("*", (req, res) => {
  res.status(404).json({ status: false, message: "Endpoint Not Found" });
});

export default app;
