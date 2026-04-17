import { type NextRequest, NextResponse } from "next/server";
import { requireAdminOrEditor, requireAdmin } from "@/lib/auth";
import { getEventById, updateEvent, deleteEvent } from "@/lib/services/events";
import { deleteFile } from "@/lib/services/storage";

function isStorageUrl(url: unknown): url is string {
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
    const event = await getEventById(id);
    if (!event) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(event);
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
    const event = await updateEvent(id, body);
    return NextResponse.json(event);
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
    const event = await getEventById(id);
    if (event?.bannerImage && isStorageUrl(event.bannerImage)) {
      await deleteFile(event.bannerImage).catch(console.error);
    }
    await deleteEvent(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
