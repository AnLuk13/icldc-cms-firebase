import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import type { User } from "./types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production",
);

// export async function createToken(user: User): Promise<string> {
//   return await new SignJWT({
//     userId: user._id || user.id,
//     email: user.email,
//     name: user.name,
//     role: user.role,
//   })
//     .setProtectedHeader({ alg: "HS256" })
//     .setIssuedAt()
//     .setExpirationTime("24h")
//     .sign(JWT_SECRET)
// }

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getAuthUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return {
    // NestJS JWTs typically use `sub` for the user ID; fall back to other common claim names
    _id: (payload._id || payload.sub || payload.userId) as string,
    email: payload.email as string,
    name: (payload.name || payload.username) as string,
    role: payload.role as "admin" | "editor",
  };
}

export async function requireAuth(): Promise<User> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  if (user.role !== "admin") {
    throw new Error("Admin role required");
  }
  return user;
}
