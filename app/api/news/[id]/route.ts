import { type NextRequest, NextResponse } from "next/server";
import { requireAdminOrEditor, requireAdmin } from "@/lib/auth";
import { getNewsById, updateNews, deleteNews } from "@/lib/services/news";
import { deleteFile } from "@/lib/services/storage";

function isStorageUrl(url: string): boolean {
  return typeof url === "string" && url.startsWith("https://storage.googleapis.com");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, status } = await requireAdminOrEditor(request);
  if (error) return NextResponse.json({ message: error }, { status });
  try {
    const { id } = await params;
    const item = await getNewsById(id);
    if (!item) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, status } = await requireAdminOrEditor(request);
  if (error) return NextResponse.json({ message: error }, { status });
  try {
    const { id } = await params;
    const body = await request.json();
    const item = await updateNews(id, body);
    return NextResponse.json(item);
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, status } = await requireAdmin(request);
  if (error) return NextResponse.json({ message: error }, { status });
  try {
    const { id } = await params;
    const item = await getNewsById(id);
    if (item) {
      const filesToDelete = [
        ...(item.documents ?? []),
        item.bannerImage,
      ].filter((url): url is string => isStorageUrl(url as string));
      await Promise.all(filesToDelete.map(deleteFile));
    }
    await deleteNews(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
