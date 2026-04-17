import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getUserById, updateUser, deleteUser } from "@/lib/services/users";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, status } = await requireAdmin(request);
  if (error) return NextResponse.json({ message: error }, { status });
  try {
    const { id } = await params;
    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(user);
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
  const { error, status } = await requireAdmin(request);
  if (error) return NextResponse.json({ message: error }, { status });
  try {
    const { id } = await params;
    const body = await request.json();
    const user = await updateUser(id, body);
    return NextResponse.json(user);
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
    await deleteUser(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
