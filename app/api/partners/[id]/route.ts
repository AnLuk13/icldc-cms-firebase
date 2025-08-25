import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

// Mock data - same as in route.ts (in production, this would be shared from a database)
const mockPartners = [
  {
    _id: "1",
    name: {
      en: "Tech Solutions Ltd",
      ro: "Tech Solutions SRL",
      ru: "Тех Солюшнс ООО",
    },
    description: {
      en: "Leading technology consulting firm specializing in digital transformation",
      ro: "Firmă de consultanță tehnologică de top specializată în transformarea digitală",
      ru: "Ведущая технологическая консалтинговая фирма, специализирующаяся на цифровой трансформации",
    },
    logo: "",
    website: "https://techsolutions.example.com",
    projects: ["1"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()
    const partner = mockPartners.find((p) => p._id === params.id)

    if (!partner) {
      return NextResponse.json({ message: "Partner not found" }, { status: 404 })
    }

    return NextResponse.json(partner)
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()
    const partnerData = await request.json()
    const partnerIndex = mockPartners.findIndex((p) => p._id === params.id)

    if (partnerIndex === -1) {
      return NextResponse.json({ message: "Partner not found" }, { status: 404 })
    }

    mockPartners[partnerIndex] = {
      ...mockPartners[partnerIndex],
      ...partnerData,
      updatedAt: new Date(),
    }

    return NextResponse.json(mockPartners[partnerIndex])
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth()
    const partnerIndex = mockPartners.findIndex((p) => p._id === params.id)

    if (partnerIndex === -1) {
      return NextResponse.json({ message: "Partner not found" }, { status: 404 })
    }

    mockPartners.splice(partnerIndex, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}
