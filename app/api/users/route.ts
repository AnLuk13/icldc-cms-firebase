import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { forwardToNestJS } from "@/lib/nestjs-proxy"

export async function GET(request: NextRequest) {
  return forwardToNestJS(request, "/users")
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    return forwardToNestJS(request, "/users")
  } catch (error) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }
}
