import { type NextRequest, NextResponse } from "next/server";
import { requireAdminOrEditor, requireAdmin } from "@/lib/auth";
import {
  getProjectById,
  updateProject,
  deleteProject,
} from "@/lib/services/projects";
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
    const project = await getProjectById(id);
    if (!project) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(project);
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
    const project = await updateProject(id, body);
    return NextResponse.json(project);
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
    const project = await getProjectById(id);
    if (project) {
      const filesToDelete = (project.documents ?? []).filter(isStorageUrl);
      await Promise.all(filesToDelete.map((url) => deleteFile(url).catch(console.error)));
    }
    await deleteProject(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
