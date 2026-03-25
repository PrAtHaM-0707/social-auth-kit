import { extractToken } from "../utils/token.js";
import { verifyGoogleToken } from "../google/verifyGoogleToken.js";
import { AUTH_ERRORS } from "../errors/codes.js";

/**
 * @typedef {Object} LoggerConfig
 * @property {Function} [error] - Error logging function
 * @property {Function} [warn] - Warning logging function
 * @property {Function} [info] - Info logging function
 * @property {Function} [debug] - Debug logging function
 */

/**
 * Express middleware for seamless Google Authentication.
 * 
 * Automatically extracts the token from the "Authorization: Bearer <token>" header,
 * verifies it, and attaches the user data to the request object.
 * 
 * @typedef {Object} ExpressGoogleAuthOptions
 * @property {string|string[]} clientId - Your Google OAuth 2.0 Client ID(s) - REQUIRED
 * @property {boolean} [required=true] - If false, authentication is optional
 * @property {string} [property="user"] - Property name to attach user to req (e.g., "user", "authUser")
 * @property {number} [timeout=5000] - Token verification timeout in milliseconds
 * @property {LoggerConfig | null} [logger] - Optional logger for debugging
 * 
 * @param {ExpressGoogleAuthOptions} options Configuration options
 * @returns {import("express").RequestHandler}
 * 
 * @example
 * // Required authentication (default)
 * app.post("/api/protected", expressGoogleAuth({ clientId: "..." }), (req, res) => {
 *   console.log(req.user);
 * });
 * 
 * @example
 * // Optional authentication
 * app.get("/api/public", expressGoogleAuth({ 
 *   clientId: "...", 
 *   required: false 
 * }), (req, res) => {
 *   if (req.user) {
 *     // User is authenticated
 *   }
 * });
 * 
 * @example
 * // Custom property name
 * app.post("/api/auth", expressGoogleAuth({ 
 *   clientId: "...",
 *   property: "authUser"
 * }), (req, res) => {
 *   console.log(req.authUser);
 * });
 */
export const expressGoogleAuth = (options) => {
  // Validate options
  if (!options || !options.clientId) {
    throw new Error(
      "['social-auth-kit/middlewares'] `clientId` is required. " +
      "Usage: expressGoogleAuth({ clientId: 'your-client-id' })"
    );
  }

  const {
    clientId,
    required = true,
    property = "user",
    timeout = 5000,
    logger = null
  } = options;

  // Validate property name
  if (typeof property !== "string" || property.trim() === "") {
    throw new Error("['social-auth-kit/middlewares'] `property` must be a non-empty string.");
  }

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const token = extractToken(authHeader);

      // Handle missing token based on 'required' option
      if (!token) {
        if (required) {
          logger?.warn?.(
            "[social-auth-kit] Missing authentication token",
            { path: req.path }
          );
          return res.status(401).json({
            error: "Unauthorized",
            message:
              "Missing or invalid Authorization header. Expected format: 'Bearer <token>'",
            code: AUTH_ERRORS.MISSING_BEARER_TOKEN
          });
        }

        // Optional authentication: explicitly set property to null and continue
        /** @type {any} */ (req)[property] = null;
        logger?.debug?.(
          "[social-auth-kit] Optional authentication - no token provided",
          { path: req.path }
        );
        return next();
      }

      // Verify the token
      const user = await verifyGoogleToken(token, clientId, {
        timeout,
        logger: logger || undefined
      });

      // Attach user to the request object using the specified property
      /** @type {any} */ (req)[property] = user;

      logger?.debug?.(
        "[social-auth-kit] User authenticated successfully",
        { email: user.email }
      );

      next();
    } catch (error) {
      const err = /** @type {any} */ (error);
      const statusCode = err.statusCode || 401;
      const errorCode = err.code || AUTH_ERRORS.AUTHENTICATION_FAILED;
      const message = err.message || "Failed to authenticate token.";

      logger?.warn?.(
        "[social-auth-kit] Authentication failed",
        { code: errorCode, statusCode, path: req.path }
      );

      return res.status(statusCode).json({
        error: "Unauthorized",
        message,
        code: errorCode
      });
    }
  };
};
