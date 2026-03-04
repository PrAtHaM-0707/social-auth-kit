import { NextResponse } from 'next/server';
import { verifyGoogleToken, AuthError } from 'social-auth-kit';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token in request body' },
        { status: 400 }
      );
    }

    // Securely verify token and extract user details
    const user = await verifyGoogleToken(token, GOOGLE_CLIENT_ID);

    // TODO: Create a session, JWT, or register user in your database
    console.log(`Authenticated Next.js user: ${user.email}`);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
