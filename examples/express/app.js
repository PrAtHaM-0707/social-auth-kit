import express from "express";
import { expressGoogleAuth } from "social-auth-kit/middlewares";

const app = express();

app.use(express.json());

// Replace with your actual frontend Google Client ID
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";

// Provide the Google Sign-in Endpoint
app.post(
  "/api/auth/google",
  // The middleware automatically reads 'Authorization: Bearer <token>'
  expressGoogleAuth({ clientId: GOOGLE_CLIENT_ID }),
  (req, res) => {
    // If the token is valid, req.user will contain the secured Google profile
    const user = req.user;
    
    // In a real application, you would:
    // 1. Find or create the user in your database using `user.email`
    // 2. Generate a session or JWT for your application
    // 3. Return your custom session token below

    res.json({
      success: true,
      message: `Welcome ${user.name}!`,
      data: user,
    });
  }
);

app.listen(3000, () => {
  console.log("Example app listening on port 3000");
});
