import { type NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      user,
      message: "User authenticated",
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
