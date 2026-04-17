import { type NextRequest, NextResponse } from "next/server";
import { requireAdminOrEditor } from "@/lib/auth";
import { getHomeContent, upsertHomeContent } from "@/lib/services/home-content";

export async function GET() {
  try {
    const content = await getHomeContent();
    return NextResponse.json(content ?? {});
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
    const content = await upsertHomeContent(body);
    return NextResponse.json(content, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const { error, status } = await requireAdminOrEditor(request);
  if (error) return NextResponse.json({ message: error }, { status });
  try {
    const body = await request.json();
    const content = await upsertHomeContent(body);
    return NextResponse.json(content);
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
