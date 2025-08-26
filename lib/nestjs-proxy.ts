import { type NextRequest, NextResponse } from "next/server";

const NESTJS_API_URL = process.env.NESTJS_API_URL || "http://localhost:3001";

export async function forwardToNestJS(
  request: NextRequest,
  path: string,
  fallbackData?: any
) {
  try {
    const url = `${NESTJS_API_URL}${path}`;

    // Get JWT token from HTTP-only cookie and add as Bearer token
    const token = request.cookies.get("auth-token")?.value;

    const headers = {
      "Content-Type": "application/json",
      // Always send Authorization header - use existing header, token from cookie, or empty Bearer
      "Authorization": token ? `Bearer ${token}` : "Bearer ",
    };

    const options: RequestInit = {
      method: request.method,
      headers,
    };

    // Add body for non-GET requests
    if (request.method !== "GET" && request.method !== "HEAD") {
      const body = await request.text();
      if (body) {
        // Check body size (10MB limit)
        const bodySize = new Blob([body]).size;
        if (bodySize > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: "Request payload too large. Maximum size is 10MB." },
            { status: 413 }
          );
        }
        options.body = body;
      }
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error forwarding to NestJS:", error);

    // Return fallback data if provided
    if (fallbackData !== undefined) {
      return NextResponse.json(fallbackData);
    }

    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }
}
