import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../config/serverConfig.js";
import userRepository from "../repository/userRepository.js";
import { customErrorResponse, internalErrorResponse } from "../utils/common/responseObject.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    // 1) Read token (prefer Authorization: Bearer <token>)
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const headerToken = req.headers["x-access-token"]; // optional fallback
    const token = bearerToken || headerToken;

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json(
        customErrorResponse({
          explanation: "Missing authentication token",
          message: "No token provided",
        })
      );
    }

    // 2) Verify token (throws on error)
    const decoded = jwt.verify(token, JWT_SECRET); // { id, iat, exp, ... }

    // 3) Load user (ensure still valid/exists)
    const user = await userRepository.getById(decoded.id);
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json(
        customErrorResponse({
          explanation: "User no longer exists or is disabled",
          message: "Invalid token",
        })
      );
    }

    // 4) Attach minimal info to request
    req.user = { id: String(user.id), role: user?.role }; // adapt fields as needed
    return next();
  } catch (error) {
    console.log("Auth middleware error:", error);

    // JWT-specific errors
    if (error.name === "TokenExpiredError") {
      return res.status(StatusCodes.UNAUTHORIZED).json(
        customErrorResponse({
          explanation: "Your session token has expired",
          message: "Token expired",
        })
      );
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(StatusCodes.UNAUTHORIZED).json(
        customErrorResponse({
          explanation: "Token could not be verified (malformed/invalid signature)",
          message: "Invalid token",
        })
      );
    }
    if (error.name === "NotBeforeError") {
      return res.status(StatusCodes.UNAUTHORIZED).json(
        customErrorResponse({
          explanation: "Token not active yet",
          message: "Token not active",
        })
      );
    }

    // Fallback
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// Must run after isAuthenticated - relies on req.user.role being set.
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json(
        customErrorResponse({
          explanation: `Requires one of the following roles: ${allowedRoles.join(", ")}`,
          message: "You do not have permission to perform this action",
        })
      );
    }
    return next();
  };
};
