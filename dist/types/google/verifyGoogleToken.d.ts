/**
 * Optimized and highly secure Google ID Token verification.
 *
 * @param {string} token - The raw ID token from the client.
 * @param {string | string[]} clientId - Your Google OAuth 2.0 Web Client ID(s).
 * @returns {Promise<{id: string, email: string|undefined, name: string|undefined, picture: string|undefined, provider: "google"}>}
 * @throws {AuthError} If validation or verification fails.
 */
export function verifyGoogleToken(token: string, clientId: string | string[]): Promise<{
    id: string;
    email: string | undefined;
    name: string | undefined;
    picture: string | undefined;
    provider: "google";
}>;
