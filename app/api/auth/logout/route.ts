import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete("auth-token");

    return NextResponse.json({ message: "Cookie removed" });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
