import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forwardToNestJS } from "@/lib/nestjs-proxy";

// Mock data - fallback when NestJS is not available
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
];

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    return forwardToNestJS(request, "/partners", mockPartners);
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    return forwardToNestJS(request, "/partners");
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
