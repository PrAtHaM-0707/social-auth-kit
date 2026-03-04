import { OAuth2Client } from "google-auth-library";
import { AuthError } from "../errors/AuthError.js";
import { AUTH_ERRORS } from "../errors/codes.js";
/**
 * Singleton instance of Google Client cache.
 * Reusing OAuth2Client is significantly faster than recreating it for every request.
 * @type {OAuth2Client | null}
 */
let cachedClient = null;
/**
 * Optimized and highly secure Google ID Token verification.
 *
 * @param {string} token - The raw ID token from the client.
 * @param {string | string[]} clientId - Your Google OAuth 2.0 Web Client ID(s).
 * @returns {Promise<{id: string, email: string|undefined, name: string|undefined, picture: string|undefined, provider: "google"}>}
 * @throws {AuthError} If validation or verification fails.
 */
export async function verifyGoogleToken(token, clientId) {
    // 1. INPUT VALIDATION LAYER
    if (!token || typeof token !== "string") {
        throw new AuthError("Google ID Token must be a non-empty string", AUTH_ERRORS.MISSING_TOKEN, 401);
    }
    if (!token.includes(".")) {
        throw new AuthError("Invalid token format", AUTH_ERRORS.INVALID_TOKEN_FORMAT, 400);
    }
    if (!clientId || (typeof clientId !== "string" && !Array.isArray(clientId))) {
        throw new AuthError("Google Client ID must be a string or an array of strings", AUTH_ERRORS.MISSING_CLIENT_ID, 400);
    }
    try {
        // 2. PERFORMANCE: Reuse OAuth2Client singleton
        if (!cachedClient) {
            cachedClient = new OAuth2Client();
        }
        const ticket = await cachedClient.verifyIdToken({
            idToken: token,
            audience: clientId,
        });
        const payload = ticket.getPayload();
        // 3. SECURITY: Detailed Verification Layer
        if (!payload) {
            throw new AuthError("Invalid Google token: payload missing", AUTH_ERRORS.INVALID_TOKEN, 401);
        }
        if (!payload.sub) {
            throw new AuthError("Invalid Google token: user id missing", AUTH_ERRORS.INVALID_USER_ID, 401);
        }
        if (!payload.email) {
            throw new AuthError("Google account email missing", AUTH_ERRORS.EMAIL_MISSING, 401);
        }
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            throw new AuthError("Google session has expired", AUTH_ERRORS.TOKEN_EXPIRED, 401);
        }
        // Strict Issuer Check (Supports both versions used by Google)
        const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
        if (!validIssuers.includes(payload.iss)) {
            throw new AuthError("Security Alert: Invalid token issuer", AUTH_ERRORS.INVALID_ISSUER, 403);
        }
        // Force Email Verification Check
        if (payload.email_verified !== true) {
            throw new AuthError("User email is not verified by Google", AUTH_ERRORS.EMAIL_NOT_VERIFIED, 401);
        }
        // Ensure the token audience matches our Client ID (Redundant but safe)
        const audiences = Array.isArray(clientId) ? clientId : [clientId];
        if (!audiences.includes(payload.aud)) {
            throw new AuthError("Token audience mismatch", AUTH_ERRORS.AUDIENCE_MISMATCH, 401);
        }
        // 4. CLEAN OUTPUT (Minimizing memory footprint)
        return Object.freeze({
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            provider: "google"
        });
    }
    catch (error) {
        // Pass through custom errors
        if (error instanceof AuthError)
            throw error;
        const err = /** @type {Error | any} */ (error);
        // Security & Logging Handlers
        const msg = err.message?.toLowerCase();
        if (msg?.includes("expired")) {
            throw new AuthError("Google session has expired", AUTH_ERRORS.TOKEN_EXPIRED, 401);
        }
        // Default generic error for security (prevents leaking internal details)
        throw new AuthError("Google authentication failed. Please check your credentials.", AUTH_ERRORS.GOOGLE_AUTH_FAILED, 401);
    }
}
