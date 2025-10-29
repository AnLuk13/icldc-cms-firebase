import { NextRequest } from "next/server"
import { forwardToNestJS } from "@/lib/nestjs-proxy"

export async function GET(request: NextRequest) {
  return forwardToNestJS(request, "/users")
}

export async function POST(request: NextRequest) {
  return forwardToNestJS(request, "/users")
}
