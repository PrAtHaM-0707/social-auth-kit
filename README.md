# social-auth-kit ??

Highly optimized, production-grade social authentication toolkit for Node.js. 

[![npm version](https://img.shields.io/badge/npm-1.0.0-blue.svg)](https://www.npmjs.com/package/social-auth-kit)
[![Security Status](https://img.shields.io/badge/Security-Production--Ready-success.svg)](https://github.com/PrAtHaM-0707/social-auth-kit)
[![TypeScript Support](https://img.shields.io/badge/TypeScript-Supported-blue.svg)](https://www.typescriptlang.org/)

## Why social-auth-kit?
- Lightweight alternative to Passport
- No session or database assumptions
- Transparent OAuth verification
- Framework-agnostic

## ? Features

- **High Performance**: Internally uses cached `OAuth2Client` singletons to minimize memory leaks and overhead.
- **Production-Ready Security**: 
  - Strict Issuer (`iss`) validation against Google domains.
  - Forced Audience (`aud`) matching to prevent account hijacking.
  - Required Verified Email (`email_verified`) check.
- **TypeScript Support**: Full type definitions included for better DX.
- **JSDoc/TSDoc**: Detailed documentation for every export.
- **Framework Independent**: Works seamlessly with Express, NestJS, Fastify, Next.js, and more.

## ?? Installation

```bash
npm install social-auth-kit
```

## ?? Quick Start (Google)

```javascript
import { verifyGoogleToken } from "social-auth-kit";

// Highly efficient validation for production environments
async function authenticate(idToken) {
  try {
    const user = await verifyGoogleToken(idToken, process.env.GOOGLE_CLIENT_ID);
    
    // Success: Returns { id, email, name, picture, provider: "google" }
    console.log(`Authenticated user: ${user.name}`);
    return user;
  } catch (error) {
    if (error.code === "TOKEN_EXPIRED") {
      // Handle session expiry logic
      console.warn("User needs to re-login");
    }
  }
}
```

## ?? Security Measures
Our verification layer implements recommended best practices from Google Cloud Platform:
1.  **Verification**: Using the official `google-auth-library` to signature check the JWT.

## ?? Advanced Usage (Middlewares)
If you are using Express, we provide a plug-and-play middleware that strictly extracts token from headers.

```javascript
import express from "express";
import { expressGoogleAuth } from "social-auth-kit/middlewares";

const app = express();

app.post(
  "/api/auth/google",
  expressGoogleAuth({ clientId: [process.env.GOOGLE_WEB_CLIENT_ID, process.env.GOOGLE_IOS_CLIENT_ID] }),
  (req, res) => {
    // If the token is valid, req.user will contain the sanitized user payload
    res.json({ message: `Welcome ${req.user.name}!`, user: req.user });
  }
);
```

### `extractToken(authHeader)` Utility
If you prefer not to use middleware, you can use our built-in header parser:

```javascript
import { extractToken } from "social-auth-kit";

// Safely extracts the token from "Bearer xy123..."
const rawToken = extractToken(req.headers.authorization);
```
2.  **Issuer**: Rejects any token not originating from `accounts.google.com`.
3.  **Audience**: Validates the `aud` claim against your unique Client ID to prevent cross-app token reuse.
4.  **Verification Status**: Enforces `email_verified: true` to prevent unconfirmed accounts.

## ?? Error Codes
The `AuthError` class returns specific codes for precise handling:
| Code | Status | Description |
| :--- | :--- | :--- |
| `MISSING_TOKEN` | 401 | No ID Token provided. |
| `INVALID_ISSUER` | 403 | Security Alert: Token forges detected. |
| `EMAIL_NOT_VERIFIED` | 401 | The user email is not verified by Google. |
| `TOKEN_EXPIRED` | 401 | The user session has timed out. |
| `GOOGLE_AUTH_FAILED` | 401 | Generic authentication failure. |

## ?? License
MIT - [LICENSE](LICENSE)
