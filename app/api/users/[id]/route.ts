import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { forwardToNestJS } from "@/lib/nestjs-proxy"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return forwardToNestJS(request, `/users/${id}`)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    return forwardToNestJS(request, `/users/${id}`)
  } catch (error) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    return forwardToNestJS(request, `/users/${id}`)
  } catch (error) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }
}
