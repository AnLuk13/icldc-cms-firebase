import { type NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

// 12-hour session
const SESSION_EXPIRES_MS = 12 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 },
      );
    }

    // Verify the ID token (proves the client already authenticated with Firebase)
    const decoded = await getAdminAuth().verifyIdToken(idToken);

    // Get user data from Firestore
    const usersSnapshot = await getAdminDb()
      .collection("users")
      .where("email", "==", decoded.email)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = {
      id: userDoc.id,
      ...userDoc.data(),
      createdAt: userDoc.data().createdAt?.toDate(),
      updatedAt: userDoc.data().updatedAt?.toDate(),
    };

    // Exchange ID token for an httpOnly session cookie with a 12-hour TTL
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_MS,
    });

    const response = NextResponse.json({
      user: userData,
      message: "Login successful",
    });

    response.cookies.set("auth-token", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_EXPIRES_MS / 1000,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);

    if (
      error.code === "auth/id-token-expired" ||
      error.code === "auth/argument-error" ||
      error.code === "auth/invalid-id-token"
    ) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 500 },
    );
  }
}
