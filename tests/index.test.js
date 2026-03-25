import { describe, it, expect } from "vitest";
import { AuthError } from "../src/errors/AuthError.js";
import { extractToken } from "../src/utils/token.js";
import { SocialAuth } from "../src/SocialAuth.js";

describe("social-auth-kit", () => {
  describe("Token Utility", () => {
    it("should extract bearer token correctly", () => {
      const token = extractToken("Bearer my-secret-token");
      expect(token).toBe("my-secret-token");
    });

    it("should return null for invalid formats", () => {
      expect(extractToken("Basic 1234")).toBeNull();
      expect(extractToken(null)).toBeNull();
      expect(extractToken("")).toBeNull();
    });
  });

  describe("SocialAuth Scalable Class", () => {
    it("should throw missing config on verify if provider is not configured", async () => {
      const auth = new SocialAuth({});
      await expect(auth.verify("google", "123")).rejects.toThrowError(
        new AuthError("Google Client ID not configured", "MISSING_CONFIG", 500)
      );
    });

    it("should throw missing provider for unknown providers", async () => {
      const auth = new SocialAuth({ google: { clientId: "xyz" } });
      await expect(auth.verify("apple", "123")).rejects.toThrowError(/not supported/i);
    });
  });

  describe("Google Authentication", () => {
    it("should fail for missing token", async () => {
      const auth = new SocialAuth({ google: { clientId: "xyz" } });
      await expect(auth.verify("google", "")).rejects.toThrowError("Google ID Token must be a non-empty string");
    });

    it("should fail for invalid token format", async () => {
      const auth = new SocialAuth({ google: { clientId: "xyz" } });
      await expect(auth.verify("google", "invalid_token_no_dots")).rejects.toThrowError("Invalid token format");
    });

    it("should fail for missing clientId", async () => {
      const { verifyGoogleToken } = await import("../src/google/verifyGoogleToken.js");
      await expect(verifyGoogleToken("a.b.c", "")).rejects.toThrowError("Google Client ID must be provided");
    });
  });
});
