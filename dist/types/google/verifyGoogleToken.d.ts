/**
 * Verifies a Google ID token with optional timeout and logging.
 *
 * @typedef {Object} VerifyOptions
 * @property {number} [timeout=5000] - Verification timeout in milliseconds
 * @property {Object} [logger] - Optional logger object
 * @property {Function} [logger.error] - Error logging function
 * @property {Function} [logger.warn] - Warning logging function
 * @property {Function} [logger.info] - Info logging function
 * @property {Function} [logger.debug] - Debug logging function
 * @property {string[]} [allowedDomains] - Optional list of allowed hosted domains (hd claim)
 *
 * @param {string} token - The raw ID token from the client.
 * @param {string | string[]} clientId - Your Google OAuth 2.0 Web Client ID(s).
 * @param {VerifyOptions} [options={}] - Additional options for verification.
 * @returns {Promise<{id: string, email: string|undefined, name: string|undefined, picture: string|undefined, provider: "google", raw: any}>}
 * @throws {AuthError} If validation or verification fails.
 */
export function verifyGoogleToken(token: string, clientId: string | string[], options?: VerifyOptions): Promise<{
    id: string;
    email: string | undefined;
    name: string | undefined;
    picture: string | undefined;
    provider: "google";
    raw: any;
}>;
/**
 * Verifies a Google ID token with optional timeout and logging.
 */
export type VerifyOptions = {
    /**
     * - Verification timeout in milliseconds
     */
    timeout?: number | undefined;
    /**
     * - Optional logger object
     */
    logger?: {
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
    } | undefined;
    /**
     * - Optional list of allowed hosted domains (hd claim)
     */
    allowedDomains?: string[] | undefined;
};
