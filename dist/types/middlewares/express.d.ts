export function expressGoogleAuth(options: ExpressGoogleAuthOptions): import("express").RequestHandler;
export type LoggerConfig = {
    /**
     * - Error logging function
     */
    error?: Function | undefined;
    /**
     * - Warning logging function
     */
    warn?: Function | undefined;
    /**
     * - Info logging function
     */
    info?: Function | undefined;
    /**
     * - Debug logging function
     */
    debug?: Function | undefined;
};
/**
 * Express middleware for seamless Google Authentication.
 *
 * Automatically extracts the token from the "Authorization: Bearer <token>" header,
 * verifies it, and attaches the user data to the request object.
 */
export type ExpressGoogleAuthOptions = {
    /**
     * - Your Google OAuth 2.0 Client ID(s) - REQUIRED
     */
    clientId: string | string[];
    /**
     * - If false, authentication is optional
     */
    required?: boolean | undefined;
    /**
     * - Property name to attach user to req (e.g., "user", "authUser")
     */
    property?: string | undefined;
    /**
     * - Token verification timeout in milliseconds
     */
    timeout?: number | undefined;
    /**
     * - Optional list of allowed hosted domains (hd claim)
     */
    allowedDomains?: string[] | undefined;
    /**
     * - Optional logger for debugging
     */
    logger?: LoggerConfig | null | undefined;
};
