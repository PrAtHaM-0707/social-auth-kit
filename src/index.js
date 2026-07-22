/**
 * @module social-auth-kit
 * Professional and lightweight social authentication toolkit for Node.js.
 */

import { verifyGoogleToken } from "./google/verifyGoogleToken.js";
import { AuthError } from "./errors/AuthError.js";
import { AUTH_ERRORS } from "./errors/codes.js";
import { extractToken } from "./utils/token.js";
import { SocialAuth } from "./SocialAuth.js";

/**
 * Cleaned user data object returned by successful authentication.
 * @typedef {Object} SocialUser
 * @property {string} id - The provider-specific unique user ID.
 * @property {string|undefined} email - The user email address.
 * @property {string|undefined} name - The full name of the user.
 * @property {string|undefined} picture - URL to the user profile photo.
 * @property {"google"} provider - The authentication provider name.
 * @property {any} raw - The original, unparsed payload from the authentication provider.
 */

/**
 * High-performance Google ID Token verification with optional timeout and logging support.
 * 
 * **Security Features**:
 * - Validates token issuer (iss), audience (aud), and email verification status
 * - Cryptographic signature verification via Google's official library
 * - Token size validation to prevent DoS attacks
 * - Clock skew tolerance (5 minutes) for distributed systems
 * 
 * **Performance**:
 * - Reuses OAuth2Client singleton (thread-safe lazy initialization)
 * - Optional async timeout handling (default: 5 seconds)
 * 
 * @typedef {Object} VerifyOptions
 * @property {number} [timeout=5000] - Verification timeout in milliseconds
 * @property {Object} [logger] - Optional logger object with error, warn, info, debug methods
 * @property {string[]} [allowedDomains] - Optional list of allowed hosted domains (hd claim)
 * 
 * @param {string} token - The raw ID token received from the frontend.
 * @param {string|string[]} clientId - Your Google OAuth 2.0 Web Client ID(s).
 * @param {VerifyOptions} [options] - Optional verification settings.
 * @returns {Promise<SocialUser>} The verified and cleaned user profile.
 * 
 * @throws {AuthError}
 * Rejects with specific error codes:
 * - "MISSING_TOKEN" (401) - No token provided
 * - "INVALID_TOKEN_FORMAT" (400) - Token format is invalid
 * - "INVALID_TOKEN" (401) - Token signature or structure is invalid
 * - "TOKEN_EXPIRED" (401) - Token has expired
 * - "VERIFICATION_TIMEOUT" (500) - Verification took too long
 * - "INVALID_ISSUER" (403) - Token issuer is not Google
 * - "EMAIL_NOT_VERIFIED" (401) - User email is not verified
 * - "AUDIENCE_MISMATCH" (401) - Token audience doesn't match clientId
 * - "GOOGLE_AUTH_FAILED" (401) - Generic authentication failure
 * 
 * @example
 * ```javascript
 * import { verifyGoogleToken } from "social-auth-kit";
 * 
 * // Basic usage
 * try {
 *   const user = await verifyGoogleToken(idToken, process.env.GOOGLE_CLIENT_ID);
 *   console.log(`Welcome, ${user.name}!`);
 * } catch (error) {
 *   console.error(error.code, error.message);
 * }
 * ```
 * 
 * @example
 * ```javascript
 * // With timeout and logging
 * const user = await verifyGoogleToken(idToken, clientId, {
 *   timeout: 3000,
 *   logger: console
 * });
 * ```
 * 
 * @example
 * ```javascript
 * // Multiple Client IDs (e.g., web and mobile)
 * const user = await verifyGoogleToken(idToken, [
 *   process.env.GOOGLE_WEB_CLIENT_ID,
 *   process.env.GOOGLE_MOBILE_CLIENT_ID
 * ]);
 * ```
 */
async function verifyGoogle(token, clientId, options = {}) {
  return await verifyGoogleToken(token, clientId, options);
}

// Exports
export {
  verifyGoogle as verifyGoogleToken,
  AuthError,
  AUTH_ERRORS,
  extractToken,
  SocialAuth
};

/**
 * Default export provide a cleaner interface for some bundlers.
 */
export default {
  verifyGoogleToken: verifyGoogle,
  AuthError,
  AUTH_ERRORS,
  extractToken,
  SocialAuth
};

