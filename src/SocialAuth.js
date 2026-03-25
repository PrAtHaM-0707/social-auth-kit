import { verifyGoogleToken } from "./google/verifyGoogleToken.js";
import { AuthError } from "./errors/AuthError.js";
import { AUTH_ERRORS } from "./errors/codes.js";

/**
 * @typedef {import('./index.js').SocialUser} SocialUser
 */

/**
 * @typedef {Object} VerifyOptions
 * @property {number} [timeout] - Optional timeout override in milliseconds
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
  constructor(config = {}) {
    this.config = config;
    this.logger = config.logger || null;
    this.timeout = config.timeout || 5000;
  }

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
  async verify(provider, token, options = {}) {
    if (provider === "google") {
      if (!this.config.google?.clientId) {
        throw new AuthError(
          "Google Client ID not configured",
          AUTH_ERRORS.MISSING_CONFIG,
          500
        );
      }

      const verifyOptions = {
        timeout: options.timeout ?? this.timeout,
        logger: (options.logger ?? this.logger) || undefined
      };

      return await verifyGoogleToken(
        token,
        this.config.google.clientId,
        verifyOptions
      );
    }

    // Future providers (Apple, Github, etc.) can be easily added here
    throw new AuthError(
      `Provider '${provider}' is not supported yet`,
      AUTH_ERRORS.UNSUPPORTED_PROVIDER,
      400
    );
  }
}
