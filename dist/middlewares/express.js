import { extractToken } from "../utils/token.js";
import { verifyGoogleToken } from "../google/verifyGoogleToken.js";
import { AUTH_ERRORS } from "../errors/codes.js";
/**
 * Express middleware for seamless Google Authentication.
 *
 * Automatically extracts the token from the "Authorization: Bearer <token>" header,
 * verifies it, and attaches the user data to `req.user`.
 *
 * @param {Object} options Configuration options
 * @param {string|string[]} options.clientId Your Google OAuth 2.0 Client ID(s)
 * @returns {import("express").RequestHandler}
 */
export const expressGoogleAuth = (options) => {
    if (!options || !options.clientId) {
        throw new Error("['social-auth-kit/middlewares'] `clientId` is required.");
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
            if (!token) {
                return res.status(401).json({
                    error: "Unauthorized",
                    message: "Missing or invalid Authorization header. Expected format: 'Bearer <token>'",
                    code: AUTH_ERRORS.MISSING_BEARER_TOKEN
                });
            }
            const user = await verifyGoogleToken(token, options.clientId);
            // Attach user to the request object
            // @ts-ignore
            req.user = user;
            next(); // Proceed to the next middleware/route handler
        }
        catch (error) {
            const err = /** @type {any} */ (error);
            const statusCode = err.statusCode || 401;
            const errorCode = err.code || AUTH_ERRORS.AUTHENTICATION_FAILED;
            const message = err.message || "Failed to authenticate token.";
            return res.status(statusCode).json({
                error: "Unauthorized",
                message,
                code: errorCode
            });
        }
    };
};
