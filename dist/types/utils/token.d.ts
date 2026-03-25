/**
 * Extracts a Bearer token from the Authorization header.
 *
 * Handles edge cases like multiple spaces and variations in format.
 * Matches "Bearer <token>" with case-insensitive "Bearer" prefix.
 *
 * @param {string | undefined | null} authHeader - The Authorization header value
 * @returns {string | null} The extracted token, or null if not present/invalid
 *
 * @example
 * extractToken("Bearer abc123") // "abc123"
 * extractToken("bearer xyz789") // "xyz789"
 * extractToken("Bearer  token") // "token" (handles multiple spaces)
 * extractToken("Basic abc123") // null (wrong scheme)
 * extractToken(null) // null
 */
export function extractToken(authHeader: string | undefined | null): string | null;
