import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forwardToNestJS } from "@/lib/nestjs-proxy";

// Mock data - fallback when NestJS is not available
const mockEvents = [
  {
    _id: "1",
    name: {
      en: "Annual Tech Conference 2024",
      ro: "Conferința Anuală de Tehnologie 2024",
      ru: "Ежегодная технологическая конференция 2024",
    },
    description: {
      en: "Join us for the biggest tech conference of the year featuring industry leaders and innovative solutions",
      ro: "Alăturați-vă nouă pentru cea mai mare conferință de tehnologie din an cu lideri din industrie și soluții inovatoare",
      ru: "Присоединяйтесь к нам на крупнейшей технологической конференции года с лидерами отрасли и инновационными решениями",
    },
    location: "Convention Center, Downtown",
    startDate: new Date("2024-06-15T09:00:00"),
    endDate: new Date("2024-06-17T18:00:00"),
    organizer: "Tech Solutions Ltd",
    registrationLink: "https://techconf2024.example.com/register",
    bannerImage: "",
    tags: ["technology", "conference", "networking"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "2",
    name: {
      en: "Community Workshop: Digital Skills",
      ro: "Atelier Comunitar: Competențe Digitale",
      ru: "Общественный семинар: Цифровые навыки",
    },
    description: {
      en: "Free workshop to help community members develop essential digital skills",
      ro: "Atelier gratuit pentru a ajuta membrii comunității să dezvolte competențe digitale esențiale",
      ru: "Бесплатный семинар для помощи членам сообщества в развитии основных цифровых навыков",
    },
    location: "Online",
    startDate: new Date("2024-04-20T14:00:00"),
    endDate: new Date("2024-04-20T16:00:00"),
    organizer: "Community Foundation",
    registrationLink: "https://digitalskills.example.com",
    bannerImage: "",
    tags: ["workshop", "community", "education"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "3",
    name: {
      en: "Innovation Showcase",
      ro: "Prezentarea Inovațiilor",
      ru: "Витрина инноваций",
    },
    description: {
      en: "Showcase of the latest innovations from our partner organizations",
      ro: "Prezentarea celor mai recente inovații de la organizațiile noastre partenere",
      ru: "Демонстрация последних инноваций от наших партнерских организаций",
    },
    location: "Innovation Hub",
    startDate: new Date("2024-03-10T10:00:00"),
    endDate: new Date("2024-03-10T17:00:00"),
    organizer: "Innovation Hub",
    tags: ["innovation", "showcase", "technology"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    return forwardToNestJS(request, "/events", mockEvents);
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    return forwardToNestJS(request, "/events");
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
