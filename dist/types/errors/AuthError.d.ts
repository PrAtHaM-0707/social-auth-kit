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
    constructor(message: string, code?: string, statusCode?: number);
    code: string;
    statusCode: number;
}
