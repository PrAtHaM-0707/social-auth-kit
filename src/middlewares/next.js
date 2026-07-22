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
 * Next.js Route Handler middleware for seamless Google Authentication.
 * 
 * Automatically extracts the token from the "Authorization: Bearer <token>" header,
 * verifies it, and attaches the user data to the request object.
 * 
 * @typedef {Object} NextGoogleAuthOptions
 * @property {string|string[]} clientId - Your Google OAuth 2.0 Client ID(s) - REQUIRED
 * @property {boolean} [required=true] - If false, authentication is optional
 * @property {string} [property="user"] - Property name to attach user to req (e.g., "user", "authUser")
 * @property {number} [timeout=5000] - Token verification timeout in milliseconds
 * @property {string[]} [allowedDomains] - Optional list of allowed hosted domains (hd claim)
 * @property {LoggerConfig | null} [logger] - Optional logger for debugging
 * 
 * @param {NextGoogleAuthOptions} options Configuration options
 * @returns {Function} A wrapper for your Next.js Route Handler
 * 
 * @example
 * // Required authentication (default)
 * export const GET = nextGoogleAuth({ clientId: "..." })(
 *   async (req, context) => {
 *     return Response.json({ message: `Hello ${req.user.name}` });
 *   }
 * );
 * 
 * @example
 * // Optional authentication
 * export const POST = nextGoogleAuth({ 
 *   clientId: "...", 
 *   required: false 
 * })(
 *   async (req, context) => {
 *     if (req.user) {
 *       // Authenticated
 *     }
 *     return Response.json({ success: true });
 *   }
 * );
 */
export const nextGoogleAuth = (options) => {
  // Validate options
  if (!options || !options.clientId) {
    throw new Error(
      "['social-auth-kit/middlewares'] `clientId` is required. " +
      "Usage: nextGoogleAuth({ clientId: 'your-client-id' })(handler)"
    );
  }

  const {
    clientId,
    required = true,
    property = "user",
    timeout = 5000,
    allowedDomains = null,
    logger = null
  } = options;

  // Validate property name
  if (typeof property !== "string" || property.trim() === "") {
    throw new Error("['social-auth-kit/middlewares'] `property` must be a non-empty string.");
  }

  /**
   * @param {Function} handler The actual Next.js route handler
   */
  return (handler) => {
    /**
     * @param {Request} req The standard Web API Request
     * @param {any} context The Next.js route context (params, etc.)
     */
    return async (req, context) => {
      try {
        // Next.js uses standard Web API Request, so we use headers.get()
        const authHeader = req.headers.get("authorization");
        const token = extractToken(authHeader);

        // Handle missing token based on 'required' option
        if (!token) {
          if (required) {
            logger?.warn?.(
              "[social-auth-kit] Missing authentication token",
              { url: req.url }
            );
            return new Response(
              JSON.stringify({
                error: "Unauthorized",
                message: "Missing or invalid Authorization header. Expected format: 'Bearer <token>'",
                code: AUTH_ERRORS.MISSING_BEARER_TOKEN
              }),
              {
                status: 401,
                headers: { "Content-Type": "application/json" }
              }
            );
          }

          // Optional authentication: explicitly set property to null and continue
          /** @type {any} */ (req)[property] = null;
          logger?.debug?.(
            "[social-auth-kit] Optional authentication - no token provided",
            { url: req.url }
          );
          return handler(req, context);
        }

        // Verify the token
        const user = await verifyGoogleToken(token, clientId, {
          timeout,
          logger: logger || undefined,
          allowedDomains: allowedDomains || undefined
        });

        // Attach user to the request object using the specified property
        /** @type {any} */ (req)[property] = user;

        logger?.debug?.(
          "[social-auth-kit] User authenticated successfully",
          { email: user.email }
        );

        return handler(req, context);
      } catch (error) {
        const err = /** @type {any} */ (error);
        const statusCode = err.statusCode || 401;
        const errorCode = err.code || AUTH_ERRORS.AUTHENTICATION_FAILED;
        const message = err.message || "Failed to authenticate token.";

        logger?.warn?.(
          "[social-auth-kit] Authentication failed",
          { code: errorCode, statusCode, url: req.url }
        );

        return new Response(
          JSON.stringify({
            error: "Unauthorized",
            message,
            code: errorCode
          }),
          {
            status: statusCode,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    };
  };
};
