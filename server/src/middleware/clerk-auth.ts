import { createClerkClient } from "@clerk/backend";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import JwksRsa from "jwks-rsa";
import { findUserByClerkId } from "../features/auth/auth.service";
import { logger } from "../utils/logger";
import dotenv from "dotenv";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";

logger.debug("is Production", { isProd });

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
if (!clerkSecretKey) {
  throw new Error("CLERK_SECRET_KEY is required");
}

const clerkClient = createClerkClient({ secretKey: clerkSecretKey });

const jwksClient = isProd
  ? JwksRsa({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
      jwksUri: "https://api.clerk.dev/.well-known/jwks.json",
    })
  : null;

function getKey(header: any, callback: any) {
  if (!jwksClient) return callback(new Error("JWKS client not available"));
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key!.getPublicKey();
    callback(null, signingKey);
  });
}

export async function clerkAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  logger.debug("Auth middleware started", {
    path: req.path,
    method: req.method,
    headers: req.headers,
  });

  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.query.token && typeof req.query.token === "string") {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    let decoded: JwtPayload | string;

    if (isProd) {
      logger.debug("Using production JWT verification (RS256)");
      decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, payload) => {
          if (err) {
            logger.error("JWT verification failed (prod)", {
              error: err.message,
            });
            reject(err);
          } else {
            logger.debug("JWT verified successfully (prod)", {
              sub: (payload as JwtPayload).sub,
              iat: (payload as JwtPayload).iat,
              exp: (payload as JwtPayload).exp,
            });
            resolve(payload as JwtPayload);
          }
        });
      });
    } else {
      const secret = process.env.CLERK_JWT_KEY;
      logger.debug("Using development JWT verification (HS256)", {
        secretAvailable: !!secret,
        secretLength: secret?.length,
      });

      if (!secret) {
        logger.error("CLERK_JWT_KEY is not defined in development");
        throw new Error(
          "CLERK_JWT_KEY must be defined in development environment"
        );
      }

      try {
        decoded = jwt.verify(token, secret, {
          algorithms: ["HS256"],
        }) as JwtPayload;
        logger.debug("JWT verified successfully (dev)", {
          sub: (decoded as JwtPayload).sub,
          iat: (decoded as JwtPayload).iat,
          exp: (decoded as JwtPayload).exp,
        });
      } catch (verifyError) {
        logger.error("JWT verification failed (dev)", {
          error:
            verifyError instanceof Error
              ? verifyError.message
              : String(verifyError),
        });
        throw verifyError;
      }
    }

    const clerkUserId = (decoded as JwtPayload).sub;
    logger.debug("Extracted clerkUserId from token", { clerkUserId });

    if (!clerkUserId) {
      logger.warn("No clerkUserId found in token payload");
      return res.status(401).json({ message: "Invalid token payload" });
    }

    logger.debug("Looking up user by clerkId", { clerkUserId });
    const user = await findUserByClerkId(clerkUserId);

    if (!user) {
      logger.warn("User not found in database", { clerkUserId });
      return res.status(401).json({
        message: "User Not found",
      });
    }

    logger.debug("User found and authenticated successfully", {
      userId: user.id,
      email: user.email,
      createdAt: user.createdAt,
    });

    req.user = user;
    next();
  } catch (error) {
    logger.error("Auth Error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      path: req.path,
      method: req.method,
    });
    return res.status(401).json({ message: "Unauthorized" });
  }
}
