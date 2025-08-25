import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import type { Partner } from "@/lib/types"

// Mock data - replace with actual MongoDB integration
const mockPartners: Partner[] = [
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
  {
    _id: "2",
    name: {
      en: "Innovation Hub",
      ro: "Centrul de Inovare",
      ru: "Инновационный хуб",
    },
    description: {
      en: "Startup incubator and innovation center",
      ro: "Incubator de startup-uri și centru de inovare",
      ru: "Инкубатор стартапов и центр инноваций",
    },
    logo: "",
    website: "https://innovationhub.example.com",
    projects: ["1", "2"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "3",
    name: {
      en: "Community Foundation",
      ro: "Fundația Comunității",
      ru: "Общественный фонд",
    },
    description: {
      en: "Non-profit organization focused on community development",
      ro: "Organizație non-profit axată pe dezvoltarea comunității",
      ru: "Некоммерческая организация, ориентированная на развитие сообщества",
    },
    logo: "",
    projects: ["2"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    return NextResponse.json(mockPartners)
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const partnerData = await request.json()

    const newPartner: Partner = {
      _id: Date.now().toString(),
      ...partnerData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockPartners.push(newPartner)

    return NextResponse.json(newPartner, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}
