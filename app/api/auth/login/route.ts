import { type NextRequest, NextResponse } from "next/server";
import { createToken } from "@/lib/auth";
import { forwardToNestJS } from "@/lib/nestjs-proxy";

export async function POST(request: NextRequest) {
  try {
    // Try to forward to NestJS first
    try {
      const nestResponse = await forwardToNestJS(request, "/auth/login");

      // If NestJS returns a successful response, extract user data and generate our own token
      if (nestResponse.ok) {
        const nestData = await nestResponse.json();

        // Extract user data from NestJS response
        let user = nestData.user || nestData;

        if (user) {
          // Normalize user data - convert id to _id if needed
          if (user.id && !user._id) {
            user = { ...user, _id: user.id };
            delete user.id;
          }

          // Create our own JWT token for frontend use
          const token = await createToken(user);

          const response = NextResponse.json({
            user,
            token,
            message: nestData.message || "Login successful",
          });

          // Set HTTP-only cookie
          response.cookies.set("auth-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60, // 24 hours
            path: "/",
          });

          return response;
        }
      }

      // If NestJS response is not ok, return it as is
      return nestResponse;
    } catch (nestError) {
      // NestJS not available, could add fallback authentication here
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
