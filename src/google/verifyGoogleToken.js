import { OAuth2Client } from "google-auth-library";
import { AuthError } from "../errors/AuthError.js";
import { AUTH_ERRORS } from "../errors/codes.js";
import { TimeoutError } from "../errors/TimeoutError.js";

/**
 * Thread-safe lazy-loaded OAuth2Client singleton.
 * Ensures only one instance is created even under high concurrency.
 * @type {Promise<OAuth2Client> | null}
 */
let clientPromise = null;

/**
 * Get or create the OAuth2Client singleton.
 * Thread-safe implementation using Promise-based initialization.
 * 
 * @returns {Promise<OAuth2Client>}
 */
async function getOAuthClient() {
  if (!clientPromise) {
    clientPromise = Promise.resolve(new OAuth2Client());
  }
  return clientPromise;
}

/**
 * Validates the Client ID format and type.
 * 
 * @param {string | string[]} clientId
 * @throws {AuthError} If validation fails
 */
function validateClientId(clientId) {
  if (!clientId) {
    throw new AuthError(
      "Google Client ID must be provided",
      AUTH_ERRORS.MISSING_CLIENT_ID,
      400
    );
  }

  if (typeof clientId === "string") {
    if (clientId.trim() === "") {
      throw new AuthError(
        "Google Client ID cannot be empty",
        AUTH_ERRORS.MISSING_CLIENT_ID,
        400
      );
    }
    return;
  }

  if (Array.isArray(clientId)) {
    if (clientId.length === 0) {
      throw new AuthError(
        "At least one Client ID must be provided",
        AUTH_ERRORS.MISSING_CLIENT_ID,
        400
      );
    }
    clientId.forEach((id, index) => {
      if (typeof id !== "string" || id.trim() === "") {
        throw new AuthError(
          `Invalid Client ID at index ${index}`,
          AUTH_ERRORS.MISSING_CLIENT_ID,
          400
        );
      }
    });
    return;
  }

  throw new AuthError(
    "Google Client ID must be a string or an array of strings",
    AUTH_ERRORS.MISSING_CLIENT_ID,
    400
  );
}

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
 * 
 * @param {string} token - The raw ID token from the client.
 * @param {string | string[]} clientId - Your Google OAuth 2.0 Web Client ID(s).
 * @param {VerifyOptions} [options={}] - Additional options for verification.
 * @returns {Promise<{id: string, email: string|undefined, name: string|undefined, picture: string|undefined, provider: "google"}>}
 * @throws {AuthError} If validation or verification fails.
 */
export async function verifyGoogleToken(token, clientId, options = {}) {
  const { timeout = 5000, logger = null } = options;

  // 1. INPUT VALIDATION LAYER
  if (!token || typeof token !== "string") {
    throw new AuthError(
      "Google ID Token must be a non-empty string",
      AUTH_ERRORS.MISSING_TOKEN,
      401
    );
  }

  // Token size validation (DoS protection)
  const MAX_TOKEN_LENGTH = 5000;
  if (token.length > MAX_TOKEN_LENGTH) {
    logger?.warn?.("Token size exceeds maximum allowed length", { length: token.length });
    throw new AuthError(
      "Token size exceeds maximum allowed length",
      AUTH_ERRORS.TOKEN_TOO_LARGE,
      400
    );
  }

  if (!token.includes(".")) {
    throw new AuthError(
      "Invalid token format",
      AUTH_ERRORS.INVALID_TOKEN_FORMAT,
      400
    );
  }

  // Validate Client ID
  validateClientId(clientId);

  try {
    // 2. PERFORMANCE: Get thread-safe OAuth2Client singleton
    const client = await getOAuthClient();

    // 3. VERIFY IDTOKEN WITH TIMEOUT
    const verificationPromise = client.verifyIdToken({
      idToken: token,
      audience: clientId,
    });

    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new TimeoutError("Token verification timeout")),
        timeout
      );
    });

    let ticket;
    try {
      ticket = await Promise.race([verificationPromise, timeoutPromise]);
    } finally {
      // Always clear timeout to prevent memory leak
      clearTimeout(timeoutId);
    }
    const payload = ticket.getPayload();

    // 4. SECURITY: Detailed Verification Layer
    if (!payload) {
      throw new AuthError(
        "Invalid Google token: payload missing",
        AUTH_ERRORS.INVALID_TOKEN,
        401
      );
    }

    if (!payload.sub) {
      throw new AuthError(
        "Invalid Google token: user id missing",
        AUTH_ERRORS.INVALID_USER_ID,
        401
      );
    }

    if (!payload.email) {
      throw new AuthError(
        "Google account email missing",
        AUTH_ERRORS.EMAIL_MISSING,
        401
      );
    }

    // Clock skew tolerance: Allow 5 minutes (300 seconds)
    const CLOCK_SKEW_SECONDS = 300;
    const expirationTime = (payload.exp + CLOCK_SKEW_SECONDS) * 1000;

    if (expirationTime < Date.now()) {
      throw new AuthError(
        "Google session has expired",
        AUTH_ERRORS.TOKEN_EXPIRED,
        401
      );
    }

    // Strict Issuer Check (Supports both versions used by Google)
    const validIssuers = [
      "accounts.google.com",
      "https://accounts.google.com"
    ];
    if (!validIssuers.includes(payload.iss)) {
      logger?.warn?.(
        "Security Alert: Invalid token issuer detected",
        { issuer: payload.iss }
      );
      throw new AuthError(
        "Security Alert: Invalid token issuer",
        AUTH_ERRORS.INVALID_ISSUER,
        403
      );
    }

    // Force Email Verification Check
    if (payload.email_verified !== true) {
      throw new AuthError(
        "User email is not verified by Google",
        AUTH_ERRORS.EMAIL_NOT_VERIFIED,
        401
      );
    }

    // Ensure the token audience matches our Client ID (Redundant but safe)
    const audiences = Array.isArray(clientId) ? clientId : [clientId];
    if (!audiences.includes(payload.aud)) {
      throw new AuthError(
        "Token audience mismatch",
        AUTH_ERRORS.AUDIENCE_MISMATCH,
        401
      );
    }

    logger?.info?.(
      "Token verified successfully",
      { email: payload.email }
    );

    // 5. CLEAN OUTPUT (Minimizing memory footprint)
    return Object.freeze({
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      provider: "google"
    });
  } catch (error) {
    // Pass through custom errors
    if (error instanceof AuthError) throw error;

    const err = /** @type {Error | any} */ (error);

    // Handle timeout errors using instanceof (reliable, not string matching)
    if (err instanceof TimeoutError) {
      logger?.warn?.("Token verification timeout", { timeout });
      throw new AuthError(
        "Token verification timeout. Please try again.",
        AUTH_ERRORS.VERIFICATION_TIMEOUT,
        500
      );
    }

    // Security & Logging Handlers
    const msg = err.message?.toLowerCase?.() || "";

    if (msg.includes("expired")) {
      throw new AuthError(
        "Google session has expired",
        AUTH_ERRORS.TOKEN_EXPIRED,
        401
      );
    }

    // Log unexpected errors for debugging
    logger?.error?.(
      "Unexpected error during token verification",
      { originalError: err.message }
    );

    // Default generic error for security (prevents leaking internal details)
    throw new AuthError(
      "Google authentication failed. Please check your credentials.",
      AUTH_ERRORS.GOOGLE_AUTH_FAILED,
      401
    );
  }
}

