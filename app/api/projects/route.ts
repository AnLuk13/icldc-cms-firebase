import { type NextRequest, NextResponse } from "next/server";
import { requireAdminOrEditor } from "@/lib/auth";
import { getProjects, createProject } from "@/lib/services/projects";

export async function GET(request: NextRequest) {
  const { error, status } = await requireAdminOrEditor(request);
  if (error) return NextResponse.json({ message: error }, { status });
  try {
    const { searchParams } = new URL(request.url);
    const projectStatus = searchParams.get("status") ?? undefined;
    const partner = searchParams.get("partner") ?? undefined;
    const projects = await getProjects({ status: projectStatus, partner });
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const { error, status } = await requireAdminOrEditor(request);
  if (error) return NextResponse.json({ message: error }, { status });
  try {
    const body = await request.json();
    const project = await createProject(body);
    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
