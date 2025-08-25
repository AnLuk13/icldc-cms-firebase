import { type NextRequest, NextResponse } from "next/server"
import { createToken } from "@/lib/auth"

// Mock user data - replace with actual MongoDB integration
const MOCK_USERS = [
  {
    _id: "1",
    email: "admin@example.com",
    password: "password123", // In production, this would be hashed
    name: "Admin User",
    role: "admin" as const,
  },
  {
    _id: "2",
    email: "editor@example.com",
    password: "password123",
    name: "Editor User",
    role: "editor" as const,
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Find user - replace with MongoDB query
    const user = MOCK_USERS.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Create JWT token
    const token = await createToken(user)

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json({
      user: userWithoutPassword,
      token,
      message: "Login successful",
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
