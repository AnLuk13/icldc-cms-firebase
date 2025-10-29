import { type NextRequest, NextResponse } from "next/server";
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

export async function forwardToNestJS(request: NextRequest, path: string) {
  try {
    const url = `${process.env.NEXT_PUBLIC_NESTJS_API_URL}${path}`;

    // Get JWT token from HTTP-only cookie and add as Bearer token
    const token = request.cookies.get("auth-token")?.value;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      // Always send Authorization header - use existing header, token from cookie, or empty Bearer
      Authorization: token ? `Bearer ${token}` : "Bearer ",
    };

    // Get request body for non-GET requests
    let requestData: any = undefined;
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
        
        // Try to parse JSON, fallback to raw text
        try {
          requestData = JSON.parse(body);
        } catch {
          requestData = body;
        }
      }
    }

    const axiosConfig: AxiosRequestConfig = {
      method: request.method as any,
      url,
      headers,
      data: requestData,
      // Don't follow redirects automatically
      maxRedirects: 0,
    };

    const response = await axios.request(axiosConfig);
    
    // Return the response data
    return NextResponse.json(response.data || { success: true });

  } catch (error) {
    console.error("Error forwarding to NestJS:", error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      
      if (axiosError.response) {
        // The request was made and the server responded with an error status
        return NextResponse.json(
          { error: axiosError.response.data?.message || axiosError.response.data || "Request failed" },
          { status: axiosError.response.status }
        );
      } else if (axiosError.request) {
        // The request was made but no response was received
        return NextResponse.json(
          { error: "NestJS backend is not available" },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
