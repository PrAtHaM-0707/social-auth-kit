# social-auth-kit 

Highly optimized, production-grade social authentication toolkit for Node.js. 

[![npm version](https://img.shields.io/badge/npm-1.1.0-blue.svg)](https://www.npmjs.com/package/social-auth-kit)
[![Security Status](https://img.shields.io/badge/Security-Production--Ready-success.svg)](https://github.com/PrAtHaM-0707/social-auth-kit)
[![TypeScript Support](https://img.shields.io/badge/TypeScript-Supported-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why social-auth-kit?
- ⚡ **Lightweight** — ~15KB, zero bloat, single dependency
- 🔒 **Secure** — Thread-safe, timeout protection, DoS prevention  
- 🚀 **Production-Ready** — Used in production environments
- 📦 **Zero Dependencies Assumptions** — No sessions, no database
- 🔄 **Framework Agnostic** — Works with any Node.js framework

## ✨ Features

- **Thread-Safe Singleton**: Promise-based OAuth2Client initialization prevents race conditions
- **Request Timeout**: Configurable timeout (default 5s) prevents hanging requests
- **DoS Protection**: Token size validation (max 5KB) prevents abuse
- **Clock Skew Handling**: 5-minute tolerance for distributed systems
- **High Performance**: Reuses OAuth2Client singleton with minimal overhead
- **Production-Ready Security**: 
  - Strict Issuer (`iss`) validation against Google domains
  - Audience (`aud`) matching to prevent account hijacking
  - Email verification (`email_verified`) enforcement
  - Cryptographic signature verification via Google's official library
- **TypeScript Support**: Full JSDoc type definitions for better DX
- **Optional Logger**: Built-in logging support for debugging
- **Flexible Middleware**: Optional authentication, custom property names
- **Framework Independent**: Express, NestJS, Fastify, Next.js, and more

## 📦 Installation

```bash
npm install social-auth-kit
```

## 🚀 Quick Start (Google)

```javascript
import { verifyGoogleToken } from "social-auth-kit";

// Verify token
async function authenticate(idToken) {
  try {
    const user = await verifyGoogleToken(idToken, process.env.GOOGLE_CLIENT_ID);
    console.log(`Welcome, ${user.name}!`);
    return user;
  } catch (error) {
    if (error.code === "TOKEN_EXPIRED") {
      console.warn("User session expired, please re-authenticate");
    }
  }
}
```

## 🛠️ Advanced Usage

### Express Middleware (Required Authentication)

```javascript
import express from "express";
import { expressGoogleAuth } from "social-auth-kit/middlewares";

const app = express();

app.post(
  "/api/auth/google",
  expressGoogleAuth({
    clientId: process.env.GOOGLE_CLIENT_ID,
    timeout: 5000  // 5 second timeout
  }),
  (req, res) => {
    res.json({
      message: `Welcome ${req.user.name}!`,
      user: req.user
    });
  }
);
```

### Express Middleware (Optional Authentication)

```javascript
// Make authentication optional with custom property
app.get(
  "/api/profile",
  expressGoogleAuth({
    clientId: process.env.GOOGLE_CLIENT_ID,
    required: false,  // Don't require token
    property: "authUser"  // Use req.authUser instead of req.user
  }),
  (req, res) => {
    if (req.authUser) {
      res.json({ message: `Hello ${req.authUser.email}` });
    } else {
      res.json({ message: "Hello guest!" });
    }
  }
);
```

### With Logging Support

```javascript
import { verifyGoogleToken } from "social-auth-kit";

const logger = {
  error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta),
  warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta),
  info: (msg, meta) => console.info(`[INFO] ${msg}`, meta),
  debug: (msg, meta) => console.debug(`[DEBUG] ${msg}`, meta)
};

const user = await verifyGoogleToken(idToken, clientId, {
  timeout: 3000,  // Custom timeout
  logger  // Pass logger
});
```

### Multiple Client IDs (Web + Mobile Apps)

```javascript
const user = await verifyGoogleToken(idToken, [
  process.env.GOOGLE_WEB_CLIENT_ID,
  process.env.GOOGLE_MOBILE_CLIENT_ID,
  process.env.GOOGLE_DESKTOP_CLIENT_ID
]);
```

### SocialAuth Class (Centralized Configuration)

```javascript
import { SocialAuth } from "social-auth-kit";

const auth = new SocialAuth({
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID
  },
  logger: console,
  timeout: 5000
});

// Use it in your app
const user = await auth.verify("google", idToken);
```

### Manual Token Extraction

```javascript
import { extractToken } from "social-auth-kit";

const token = extractToken(req.headers.authorization);
// automatically handles:
// - "Bearer token123" ✅
// - "bearer TOKEN456" ✅
// - "Bearer  token" (multiple spaces) ✅
// - "Basic token" ❌ (wrong scheme)
// - null/undefined ❌
```

## 🔒 Security Measures

Our verification layer implements best practices from Google Cloud Platform:

1. **Signature Verification**: Cryptographic validation using official `google-auth-library`
2. **Issuer Validation**: Only accepts tokens from `accounts.google.com`
3. **Audience Validation**: Ensures token is issued for your specific Client ID
4. **Email Verification**: Enforces verified email status to prevent unconfirmed accounts
5. **Token Expiration**: Validates token hasn't expired (with 5-minute clock skew tolerance)
6. **Token Size Limit**: Rejects tokens larger than 5KB (DoS protection)
7. **Timeout Protection**: Verification requests timeout after 5 seconds by default

## ⚙️ Configuration Options

### `verifyGoogleToken(token, clientId, options)`

```typescript
interface VerifyOptions {
  timeout?: number;  // Verification timeout in ms (default: 5000)
  logger?: {
    error?: (msg: string, meta?: any) => void;
    warn?: (msg: string, meta?: any) => void;
    info?: (msg: string, meta?: any) => void;
    debug?: (msg: string, meta?: any) => void;
  };
}
```

### `expressGoogleAuth(options)`

```typescript
interface MiddlewareOptions {
  clientId: string | string[];  // Google Client ID(s) - REQUIRED
  required?: boolean;             // Require token (default: true)
  property?: string;              // Attach user to req.property (default: "user")
  timeout?: number;               // Verification timeout ms (default: 5000)
  logger?: LoggerObject;          // Logger instance
}
```

## 📋 Error Codes

The `AuthError` class returns specific codes for precise error handling:

| Code | Status | Description |
| :--- | :--- | :--- |
| `MISSING_TOKEN` | 401 | No authorization token provided |
| `INVALID_TOKEN_FORMAT` | 400 | Token format is invalid (missing dots) |
| `TOKEN_TOO_LARGE` | 400 | Token size exceeds maximum allowed length |
| `INVALID_TOKEN` | 401 | Token signature or structure is invalid |
| `TOKEN_EXPIRED` | 401 | Token has expired (with clock skew tolerance) |
| `VERIFICATION_TIMEOUT` | 500 | Token verification timeout |
| `INVALID_ISSUER` | 403 | Token issuer is not Google (potential security threat) |
| `EMAIL_NOT_VERIFIED` | 401 | User's email is not verified with Google |
| `AUDIENCE_MISMATCH` | 401 | Token audience doesn't match Client ID |
| `MISSING_CLIENT_ID` | 400 | Client ID is not configured |
| `GOOGLE_AUTH_FAILED` | 401 | Generic authentication failure |

## 📝 Error Handling Example

```javascript
import { verifyGoogleToken, AuthError } from "social-auth-kit";

try {
  const user = await verifyGoogleToken(idToken, clientId);
} catch (error) {
  if (error instanceof AuthError) {
    switch (error.code) {
      case "TOKEN_EXPIRED":
        // Handle session expiry - redirect to login
        res.redirect("/login");
        break;
      case "EMAIL_NOT_VERIFIED":
        // Handle unverified email
        res.status(403).json({ error: "Please verify your email" });
        break;
      case "INVALID_ISSUER":
        // Potential security threat
        console.warn("Possible token forgery attempt:", error);
        res.status(403).json({ error: "Invalid token" });
        break;
      case "VERIFICATION_TIMEOUT":
        // Network/server issue
        res.status(503).json({ error: "Service temporarily unavailable" });
        break;
      default:
        res.status(error.statusCode || 401).json({ error: error.message });
    }
  } else {
    // Unexpected error
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
```

## 📚 TypeScript Support

Full TypeScript support with JSDoc type definitions:

```typescript
import { verifyGoogleToken, SocialUser, AuthError } from "social-auth-kit";

const user: SocialUser = await verifyGoogleToken(
  idToken,
  clientId,
  { timeout: 5000 }
);

console.log(user.id);       // string
console.log(user.email);    // string | undefined
console.log(user.name);     // string | undefined
console.log(user.picture);  // string | undefined
console.log(user.provider); // "google"
```

## 🎯 Production Best Practices

### 1. Always Use HTTPS

```javascript
// Middleware to enforce HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

### 2. Rate Limiting

```javascript
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 requests
  message: "Too many auth attempts"
});

app.post("/api/auth/google", authLimiter, expressGoogleAuth(opts), handler);
```

### 3. Set Up Logging

```javascript
const logger = {
  error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta),
  warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta),
  info: (msg, meta) => console.log(`[INFO] ${msg}`, meta)
};

app.post(
  "/api/auth/google",
  expressGoogleAuth({
    clientId: process.env.GOOGLE_CLIENT_ID,
    logger
  }),
  handler
);
```

## 📄 License

MIT - See [LICENSE](./LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ❓ FAQ

**Q: Do I need a database?**  
A: No, this library only verifies tokens. Session/user management is your responsibility.

**Q: Does it support other providers (GitHub, Apple, Microsoft)?**  
A: Currently Google only. Future versions will support additional providers.

**Q: Can I use this with frameworks other than Express?**  
A: Yes! The core `verifyGoogleToken()` is framework-agnostic. Only the middleware is Express-specific.

**Q: What about clock skew?**  
A: We allow 5 minutes of clock skew to handle distributed system timing differences.

**Q: Is the singleton thread-safe?**  
A: Yes, we use Promise-based lazy initialization to prevent race conditions.

## License
MIT - [LICENSE](LICENSE)
