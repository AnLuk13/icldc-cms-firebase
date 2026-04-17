import { type NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("auth-token")?.value;

    // Revoke server-side refresh tokens so the cookie is dead even if captured
    if (sessionCookie) {
      try {
        const decoded = await getAdminAuth().verifySessionCookie(sessionCookie);
        await getAdminAuth().revokeRefreshTokens(decoded.uid);
      } catch {
        // Cookie already invalid — proceed with cleanup
      }
    }

    // Client-side signOut(auth) is handled by the caller (header.tsx)
    const response = NextResponse.json({ message: "Logout successful" });
    response.cookies.delete("auth-token");
    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: error.message || "Logout failed" },
      { status: 500 },
    );
  }
}
