import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

// Mock data - same as in route.ts (in production, this would be shared from a database)
const mockProjects = [
  {
    _id: "1",
    name: {
      en: "Digital Transformation Initiative",
      ro: "Inițiativa de Transformare Digitală",
      ru: "Инициатива цифровой трансформации",
    },
    description: {
      en: "Modernizing our digital infrastructure and processes",
      ro: "Modernizarea infrastructurii și proceselor noastre digitale",
      ru: "Модернизация нашей цифровой инфраструктуры и процессов",
    },
    status: "ongoing",
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-12-31"),
    partners: ["1", "2"],
    documents: [],
    tags: ["technology", "modernization"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()
    const project = mockProjects.find((p) => p._id === params.id)

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()
    const projectData = await request.json()
    const projectIndex = mockProjects.findIndex((p) => p._id === params.id)

    if (projectIndex === -1) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
    }

    mockProjects[projectIndex] = {
      ...mockProjects[projectIndex],
      ...projectData,
      updatedAt: new Date(),
    }

    return NextResponse.json(mockProjects[projectIndex])
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()
    const projectIndex = mockProjects.findIndex((p) => p._id === params.id)

    if (projectIndex === -1) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
    }

    mockProjects.splice(projectIndex, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}
