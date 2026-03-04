/**
 * Custom error class for authentication related issues.
 * Provides machine-readable codes and HTTP-friendly status codes.
 */
export class AuthError extends Error {
    /**
     * @param {string} message - Human-readable error message.
     * @param {string} [code="SOCIAL_AUTH_ERROR"] - Machine-readable error code.
     * @param {number} [statusCode=401] - Suggested HTTP status code.
     */
    constructor(message, code = "SOCIAL_AUTH_ERROR", statusCode = 401) {
        super(message);
        this.name = "AuthError";
        this.code = code;
        this.statusCode = statusCode;
        // Captures stack trace in V8 environments (Node.js)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AuthError);
        }
    }
}
