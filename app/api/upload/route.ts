import { type NextRequest, NextResponse } from "next/server";
import { requireAdminOrEditor } from "@/lib/auth";
import { uploadFile } from "@/lib/services/storage";

export async function POST(request: NextRequest) {
  const { error, status } = await requireAdminOrEditor(request);
  if (error) return NextResponse.json({ message: error }, { status });
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string | null) ?? "uploads";

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const url = await uploadFile(buffer, file.name, folder);
    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
