import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forwardToNestJS } from "@/lib/nestjs-proxy";

// Mock data - fallback when NestJS is not available
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
  {
    _id: "2",
    name: {
      en: "Community Outreach Program",
      ro: "Program de Implicare în Comunitate",
      ru: "Программа работы с сообществом",
    },
    description: {
      en: "Building stronger connections with local communities",
      ro: "Construirea unor legături mai puternice cu comunitățile locale",
      ru: "Построение более прочных связей с местными сообществами",
    },
    status: "planned",
    startDate: new Date("2024-03-01"),
    partners: ["3"],
    documents: [],
    tags: ["community", "outreach"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    return forwardToNestJS(request, "/projects", mockProjects);
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    return forwardToNestJS(request, "/projects");
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
