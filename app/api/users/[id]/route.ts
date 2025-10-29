import { NextRequest } from "next/server"
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
  const { id } = await params
  return forwardToNestJS(request, `/users/${id}`)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return forwardToNestJS(request, `/users/${id}`)
}
