import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { verifyGoogleToken } from "../src/google/verifyGoogleToken.js";
import { AuthError } from "../src/errors/AuthError.js";
import { AUTH_ERRORS } from "../src/errors/codes.js";

// 1. Setup Vitest Mock for Google Auth Library
const { mockVerifyIdToken } = vi.hoisted(() => ({
  mockVerifyIdToken: vi.fn()
}));

vi.mock("google-auth-library", () => {
  return {
    OAuth2Client: class {
      verifyIdToken(...args) {
        return mockVerifyIdToken(...args);
      }
    }
  };
});

describe("Google Authentication (verifyGoogleToken)", () => {
  const VALID_CLIENT_ID = "test-client-id";
  const VALID_TOKEN = "header.payload.signature";

  // Base payload that matches all security constraints
  const getValidPayload = () => ({
    sub: "1234567890",
    email: "test@example.com",
    name: "Test User",
    picture: "https://example.com/photo.jpg",
    email_verified: true,
    iss: "https://accounts.google.com",
    aud: VALID_CLIENT_ID,
    exp: Math.floor(Date.now() / 1000) + 3600 // Expires in 1 hour
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Input & DoS Validation", () => {
    it("should reject extremely large tokens (DoS Protection)", async () => {
      const massiveToken = "a".repeat(5001); // Max is 5000
      await expect(verifyGoogleToken(massiveToken, VALID_CLIENT_ID))
        .rejects.toThrowError(new AuthError("Token size exceeds maximum allowed length", AUTH_ERRORS.TOKEN_TOO_LARGE, 400));
    });

    it("should reject invalid token formats (missing dots)", async () => {
      await expect(verifyGoogleToken("invalidtokenstring", VALID_CLIENT_ID))
        .rejects.toThrowError(new AuthError("Invalid token format", AUTH_ERRORS.INVALID_TOKEN_FORMAT, 400));
    });
  });

  describe("Timeout Protection", () => {
    it("should timeout if Google verification takes too long", async () => {
      // Simulate a very slow response from Google
      mockVerifyIdToken.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 200)));
      
      // Pass a 50ms timeout
      await expect(verifyGoogleToken(VALID_TOKEN, VALID_CLIENT_ID, { timeout: 50 }))
        .rejects.toThrowError(new AuthError("Token verification timeout. Please try again.", AUTH_ERRORS.VERIFICATION_TIMEOUT, 500));
    });
  });

  describe("Security Layers (Payload Validation)", () => {
    it("should reject if sub (user id) is missing", async () => {
      const payload = getValidPayload();
      delete payload.sub;
      mockVerifyIdToken.mockResolvedValue({ getPayload: () => payload });

      await expect(verifyGoogleToken(VALID_TOKEN, VALID_CLIENT_ID))
        .rejects.toThrowError(new AuthError("Invalid Google token: user id missing", AUTH_ERRORS.INVALID_USER_ID, 401));
    });

    it("should reject if email is missing", async () => {
      const payload = getValidPayload();
      delete payload.email;
      mockVerifyIdToken.mockResolvedValue({ getPayload: () => payload });

      await expect(verifyGoogleToken(VALID_TOKEN, VALID_CLIENT_ID))
        .rejects.toThrowError(new AuthError("Google account email missing", AUTH_ERRORS.EMAIL_MISSING, 401));
    });

    it("should reject expired tokens", async () => {
      const payload = getValidPayload();
      // Set expiration to 1 hour ago
      payload.exp = Math.floor(Date.now() / 1000) - 3600;
      mockVerifyIdToken.mockResolvedValue({ getPayload: () => payload });

      await expect(verifyGoogleToken(VALID_TOKEN, VALID_CLIENT_ID))
        .rejects.toThrowError(new AuthError("Google session has expired", AUTH_ERRORS.TOKEN_EXPIRED, 401));
    });

    it("should reject invalid issuers", async () => {
      const payload = getValidPayload();
      payload.iss = "https://evil.com";
      mockVerifyIdToken.mockResolvedValue({ getPayload: () => payload });

      await expect(verifyGoogleToken(VALID_TOKEN, VALID_CLIENT_ID))
        .rejects.toThrowError(new AuthError("Security Alert: Invalid token issuer", AUTH_ERRORS.INVALID_ISSUER, 403));
    });

    it("should reject unverified emails", async () => {
      const payload = getValidPayload();
      payload.email_verified = false;
      mockVerifyIdToken.mockResolvedValue({ getPayload: () => payload });

      await expect(verifyGoogleToken(VALID_TOKEN, VALID_CLIENT_ID))
        .rejects.toThrowError(new AuthError("User email is not verified by Google", AUTH_ERRORS.EMAIL_NOT_VERIFIED, 401));
    });

    it("should reject audience mismatch", async () => {
      const payload = getValidPayload();
      payload.aud = "some-other-client-id";
      mockVerifyIdToken.mockResolvedValue({ getPayload: () => payload });

      await expect(verifyGoogleToken(VALID_TOKEN, VALID_CLIENT_ID))
        .rejects.toThrowError(new AuthError("Token audience mismatch", AUTH_ERRORS.AUDIENCE_MISMATCH, 401));
    });

    it("should reject if domain is not in allowedDomains list", async () => {
      const payload = getValidPayload();
      payload.hd = "unauthorized.com";
      mockVerifyIdToken.mockResolvedValue({ getPayload: () => payload });

      await expect(verifyGoogleToken(VALID_TOKEN, VALID_CLIENT_ID, { allowedDomains: ["company.com"] }))
        .rejects.toThrowError(new AuthError("User domain is not authorized", AUTH_ERRORS.DOMAIN_NOT_ALLOWED, 403));
    });

    it("should succeed if domain IS in allowedDomains list", async () => {
      const payload = getValidPayload();
      payload.hd = "company.com";
      mockVerifyIdToken.mockResolvedValue({ getPayload: () => payload });

      const user = await verifyGoogleToken(VALID_TOKEN, VALID_CLIENT_ID, { allowedDomains: ["company.com"] });
      expect(user.email).toBe(payload.email);
    });
  });

  describe("Happy Path", () => {
    it("should return frozen SocialUser object on success", async () => {
      const payload = getValidPayload();
      mockVerifyIdToken.mockResolvedValue({ getPayload: () => payload });

      const user = await verifyGoogleToken(VALID_TOKEN, VALID_CLIENT_ID);
      
      expect(user).toEqual({
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        provider: "google",
        raw: payload
      });

      // Ensure it is frozen
      expect(Object.isFrozen(user)).toBe(true);
    });
  });
});
