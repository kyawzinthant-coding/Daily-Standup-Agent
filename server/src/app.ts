import express from "express";

import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { accessLogFormat, auditLogFormat } from "./configs/log-formats";

import { auditLogStream } from "./middleware/audit-log";

import { Request, Response } from "express";

import path from "path";
import morgan from "morgan";
import { logger } from "./utils/logger";
import routes from "./routes";
import { errorHandler } from "./middleware/error-handler";
const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json());

// Middleware to parse URL-encoded payloads (e.g., form submissions)
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(morgan(accessLogFormat));

// Custom logging middleware using our structured logger
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const responseTime = Date.now() - start;
    logger.request(req, res, responseTime);
  });

  next();
});

morgan.token("body", (req) => JSON.stringify((req as express.Request).body));
app.use(morgan(auditLogFormat, { stream: auditLogStream }));

app.use(routes);

app.use(errorHandler);

export default app;
