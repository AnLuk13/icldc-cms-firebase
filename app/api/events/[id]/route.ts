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
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    return forwardToNestJS(
      request,
      `/events/${params.id}`,
      mockEvents.find((e) => e._id === params.id)
    );
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    return forwardToNestJS(request, `/events/${params.id}`);
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    return forwardToNestJS(request, `/events/${params.id}`);
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
