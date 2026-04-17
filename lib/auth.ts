import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { User } from "./types";

export interface AuthUser {
  uid: string;
  email: string;
  role: string;
}

/**
 * Verify Firebase ID token from Authorization: Bearer header.
 * Returns decoded user info or null if invalid/missing.
 */
export async function verifyAuthToken(
  request: NextRequest,
): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email ?? "";

    const userDoc = await getAdminDb().collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();
    return {
      uid,
      email,
      role: userData?.role ?? "",
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

/**
 * Check if authenticated user is admin.
 */
export async function isAdmin(request: NextRequest): Promise<boolean> {
  const user = await verifyAuthToken(request);
  return user?.role === "admin";
}

/**
 * Require admin role or return 401/403 response object.
 * TODO: Re-enable once the first admin user has been created.
 */
export async function requireAdmin(_request: NextRequest) {
  // AUTH BYPASS — remove this block and restore the original after first user creation
  return { error: null, status: 200, user: null };

  // const user = await verifyAuthToken(_request);
  // if (!user) return { error: "Unauthorized - No valid token", status: 401, user: null };
  // if (user.role !== "admin") return { error: "Forbidden - Admin access required", status: 403, user };
  // return { error: null, status: 200, user };
}

/**
 * Require admin or editor role or return 401/403 response object.
 * TODO: Re-enable once the first admin user has been created.
 */
export async function requireAdminOrEditor(_request: NextRequest) {
  // AUTH BYPASS — remove this block and restore the original after first user creation
  return { error: null, status: 200, user: null };

  // const user = await verifyAuthToken(_request);
  // if (!user) return { error: "Unauthorized - No valid token", status: 401, user: null };
  // if (user.role !== "admin" && user.role !== "editor") {
  //   return { error: "Forbidden - Admin or Editor access required", status: 403, user };
  // }
  // return { error: null, status: 200, user };
}

/**
 * Session-cookie auth  used only by /api/auth/me for initial client hydration.
 */
export async function getAuthUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth-token")?.value;

  if (!sessionCookie) return null;

  try {
    const decodedClaims = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true,
    );

    const userDoc = await getAdminDb()
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userDoc.exists) return null;

    const userData = userDoc.data()!;
    return {
      _id: decodedClaims.uid,
      email: decodedClaims.email!,
      name: userData.name ?? decodedClaims.name,
      role: (userData.role ?? "editor") as "admin" | "editor",
    };
  } catch {
    return null;
  }
}
