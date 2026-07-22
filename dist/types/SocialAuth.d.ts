/**
 * @typedef {import('./index.js').SocialUser} SocialUser
 */
/**
 * @typedef {Object} VerifyOptions
 * @property {number} [timeout] - Optional timeout override in milliseconds
 * @property {string[]} [allowedDomains] - Optional list of allowed hosted domains (hd claim)
 * @property {Object} [logger] - Optional logger override
 */
/**
 * @typedef {Object} SocialAuthConfig
 * @property {Object} [google] Google OAuth configuration
 * @property {string|string[]} [google.clientId] Google Client ID(s)
 * @property {Object} [logger] Optional logger instance
 * @property {Function} [logger.error] Error logging function
 * @property {Function} [logger.warn] Warning logging function
 * @property {Function} [logger.info] Info logging function
 * @property {Function} [logger.debug] Debug logging function
 * @property {number} [timeout] Verification timeout in milliseconds
 */
/**
 * Enterprise-scalable authentication instance for multi-provider support.
 *
 * Allows configuration of multiple authentication providers in a single instance,
 * with support for optional logging and custom timeout settings.
 *
 * @example
 * ```javascript
 * const auth = new SocialAuth({
 *   google: {
 *     clientId: "your-client-id.apps.googleusercontent.com"
 *   },
 *   logger: console,
 *   timeout: 5000
 * });
 *
 * const user = await auth.verify("google", idToken);
 * ```
 */
export class SocialAuth {
    /**
     * @param {SocialAuthConfig} [config={}] Configuration object
     */
    constructor(config?: SocialAuthConfig);
    config: SocialAuthConfig;
    logger: {
        /**
         * Error logging function
         */
        error?: Function | undefined;
        /**
         * Warning logging function
         */
        warn?: Function | undefined;
        /**
         * Info logging function
         */
        info?: Function | undefined;
        /**
         * Debug logging function
         */
        debug?: Function | undefined;
    } | null;
    timeout: number;
    /**
     * Verify an authentication token for a specific provider.
     *
     * @param {"google"} provider - The provider name (e.g. "google")
     * @param {string} token - The raw ID token from the frontend
     * @param {VerifyOptions} [options] - Additional verification options
     * @returns {Promise<SocialUser>} The verified user profile
     *
     * @throws {AuthError} If provider is not configured or verification fails
     *
     * @example
     * ```javascript
     * try {
     *   const user = await auth.verify("google", idToken);
     *   console.log(user.email);
     * } catch (error) {
     *   console.error(error.code);
     * }
     * ```
     */
    verify(provider: "google", token: string, options?: VerifyOptions): Promise<SocialUser>;
}
export type SocialUser = import("./index.js").SocialUser;
export type VerifyOptions = {
    /**
     * - Optional timeout override in milliseconds
     */
    timeout?: number | undefined;
    /**
     * - Optional list of allowed hosted domains (hd claim)
     */
    allowedDomains?: string[] | undefined;
    /**
     * - Optional logger override
     */
    logger?: Object | undefined;
};
export type SocialAuthConfig = {
    /**
     * Google OAuth configuration
     */
    google?: {
        /**
         * Google Client ID(s)
         */
        clientId?: string | string[] | undefined;
    } | undefined;
    /**
     * Optional logger instance
     */
    logger?: {
        /**
         * Error logging function
         */
        error?: Function | undefined;
        /**
         * Warning logging function
         */
        warn?: Function | undefined;
        /**
         * Info logging function
         */
        info?: Function | undefined;
        /**
         * Debug logging function
         */
        debug?: Function | undefined;
    } | undefined;
    /**
     * Verification timeout in milliseconds
     */
    timeout?: number | undefined;
};
