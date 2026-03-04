import { verifyGoogleToken } from "./google/verifyGoogleToken.js";
import { AuthError } from "./errors/AuthError.js";
import { AUTH_ERRORS } from "./errors/codes.js";
/**
 * @typedef {import('./index.js').SocialUser} SocialUser
 */
/**
 * Enterprise scalable authentication instance.
 * Allows configuration of multiple providers at once.
 */
export class SocialAuth {
    /**
     * @param {Object} config
     * @param {Object} [config.google]
     * @param {string|string[]} config.google.clientId
     */
    constructor(config = {}) {
        this.config = config;
    }
    /**
     * Verify an authentication token for a specific provider.
     *
     * @param {"google"} provider - The provider name (e.g. "google")
     * @param {string} token - The raw ID token from the frontend
     * @returns {Promise<SocialUser>}
     */
    async verify(provider, token) {
        if (provider === "google") {
            if (!this.config.google?.clientId) {
                throw new AuthError("Google Client ID not configured", AUTH_ERRORS.MISSING_CONFIG, 500);
            }
            return await verifyGoogleToken(token, this.config.google.clientId);
        }
        // Future providers (Apple, Github, etc.) can be easily added here
        throw new AuthError(`Provider '${provider}' is not supported yet`, AUTH_ERRORS.UNSUPPORTED_PROVIDER, 400);
    }
}
