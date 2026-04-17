import { type NextRequest, NextResponse } from "next/server";
import { requireAdminOrEditor } from "@/lib/auth";
import { deleteFile } from "@/lib/services/storage";

export async function POST(request: NextRequest) {
  const { error, status } = await requireAdminOrEditor(request);
  if (error) return NextResponse.json({ message: error }, { status });
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ message: "Missing url" }, { status: 400 });
    }
    await deleteFile(url);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Delete failed" }, { status: 500 });
  }
}
