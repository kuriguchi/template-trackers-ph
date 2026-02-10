import { jwtDecode } from "jwt-decode";

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return Response.json({ error: "OAuth token is required." }, { status: 400 });
    }

    // Verify and decode the token
    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (decodeError) {
      return Response.json({ error: "Invalid OAuth token." }, { status: 400 });
    }

    // Extract email from token
    const email = decoded?.email;
    const emailVerified = decoded?.email_verified;

    if (!email) {
      return Response.json({ error: "Email not found in token." }, { status: 400 });
    }

    // Ensure it's a Gmail account
    if (!email.endsWith("@gmail.com")) {
      return Response.json(
        { error: "Only Gmail accounts are supported. Please use a @gmail.com email address." },
        { status: 400 }
      );
    }

    // Ensure email is verified
    if (!emailVerified) {
      return Response.json(
        { error: "Your Gmail account email is not verified. Please verify it in your Google Account settings." },
        { status: 400 }
      );
    }

    return Response.json({
      email,
      verified: true,
    });
  } catch (error) {
    console.error("OAuth verification error:", error?.message);
    return Response.json(
      { error: error?.message || "Failed to verify OAuth token." },
      { status: 500 }
    );
  }
}
