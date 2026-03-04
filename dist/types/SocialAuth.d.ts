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
    constructor(config?: {
        google?: {
            clientId: string | string[];
        } | undefined;
    });
    config: {
        google?: {
            clientId: string | string[];
        } | undefined;
    };
    /**
     * Verify an authentication token for a specific provider.
     *
     * @param {"google"} provider - The provider name (e.g. "google")
     * @param {string} token - The raw ID token from the frontend
     * @returns {Promise<SocialUser>}
     */
    verify(provider: "google", token: string): Promise<SocialUser>;
}
export type SocialUser = import("./index.js").SocialUser;
