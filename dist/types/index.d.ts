declare namespace _default {
    export { verifyGoogle as verifyGoogleToken };
    export { AuthError };
    export { AUTH_ERRORS };
    export { extractToken };
    export { SocialAuth };
}
export default _default;
/**
 * Cleaned user data object returned by successful authentication.
 */
export type SocialUser = {
    /**
     * - The provider-specific unique user ID.
     */
    id: string;
    /**
     * - The user email address.
     */
    email: string | undefined;
    /**
     * - The full name of the user.
     */
    name: string | undefined;
    /**
     * - URL to the user profile photo.
     */
    picture: string | undefined;
    /**
     * - The authentication provider name.
     */
    provider: "google";
};
/**
 * Cleaned user data object returned by successful authentication.
 * @typedef {Object} SocialUser
 * @property {string} id - The provider-specific unique user ID.
 * @property {string|undefined} email - The user email address.
 * @property {string|undefined} name - The full name of the user.
 * @property {string|undefined} picture - URL to the user profile photo.
 * @property {"google"} provider - The authentication provider name.
 */
/**
 * High-performance Google ID Token verification.
 *
 * Performance: Uses a cached OAuth2Client singleton internally.
 * Security: Validates issuer (iss), audience (aud), and email_verified.
 *
 * @param {string} token - The raw ID token received from the frontend.
 * @param {string} clientId - Your Google OAuth 2.0 Web Client ID.
 * @returns {Promise<SocialUser>} The verified and cleaned user profile.
 *
 * @throws {AuthError}
 * Rejects with:
 * - "MISSING_TOKEN" (401)
 * - "INVALID_TOKEN" (401)
 * - "INVALID_ISSUER" (403)
 * - "EMAIL_NOT_VERIFIED" (401)
 * - "AUDIENCE_MISMATCH" (401)
 * - "TOKEN_EXPIRED" (401)
 *
 * @example
 * ```javascript
 * import { verifyGoogleToken } from "social-auth-kit";
 *
 * try {
 *   const user = await verifyGoogleToken(idToken, process.env.GOOGLE_CLIENT_ID);
 *   console.log(`Welcome, ${user.name}!`);
 * } catch (error) {
 *   if (error.code === "TOKEN_EXPIRED") {
 *      // Handle re-authentication
 *   }
 * }
 * ```
 */
declare function verifyGoogle(token: string, clientId: string): Promise<SocialUser>;
import { AuthError } from "./errors/AuthError.js";
import { AUTH_ERRORS } from "./errors/codes.js";
import { extractToken } from "./utils/token.js";
import { SocialAuth } from "./SocialAuth.js";
export { verifyGoogle as verifyGoogleToken, AuthError, AUTH_ERRORS, extractToken, SocialAuth };
