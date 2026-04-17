import { type NextRequest, NextResponse } from "next/server";
import { requireAdminOrEditor, requireAdmin } from "@/lib/auth";
import {
  getPartnerById,
  updatePartner,
  deletePartner,
} from "@/lib/services/partners";
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
    const partner = await getPartnerById(id);
    if (!partner) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(partner);
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
    const partner = await updatePartner(id, body);
    return NextResponse.json(partner);
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
    const partner = await getPartnerById(id);
    if (partner?.logo && isStorageUrl(partner.logo)) {
      await deleteFile(partner.logo).catch(console.error);
    }
    await deletePartner(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
