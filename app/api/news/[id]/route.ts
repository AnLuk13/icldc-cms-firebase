import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forwardToNestJS } from "@/lib/nestjs-proxy";

// Mock data - same as in route.ts (in production, this would be shared from a database)
const mockNews = [
  {
    _id: "1",
    name: {
      en: "Digital Transformation Success Story",
      ro: "Povestea de Succes a Transformării Digitale",
      ru: "История успеха цифровой трансформации",
    },
    content: {
      en: "Our organization has successfully completed the first phase of digital transformation, implementing new technologies that have improved efficiency by 40%. This milestone represents months of hard work and collaboration between our teams and technology partners.",
      ro: "Organizația noastră a finalizat cu succes prima fază a transformării digitale, implementând tehnologii noi care au îmbunătățit eficiența cu 40%. Această realizare reprezintă luni de muncă asiduă și colaborare între echipele noastre și partenerii tehnologici.",
      ru: "Наша организация успешно завершила первый этап цифровой трансформации, внедрив новые технологии, которые повысили эффективность на 40%. Эта веха представляет месяцы упорной работы и сотрудничества между нашими командами и технологическими партнерами.",
    },
    summary: {
      en: "First phase of digital transformation completed with 40% efficiency improvement",
      ro: "Prima fază a transformării digitale finalizată cu o îmbunătățire a eficienței de 40%",
      ru: "Первый этап цифровой трансформации завершен с повышением эффективности на 40%",
    },
    author: "Tech Team",
    documents: [],
    category: "Technology",
    tags: ["digital transformation", "technology", "efficiency"],
    publishedAt: new Date("2024-02-15T10:00:00"),
    bannerImage: "",
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
      `/news/${params.id}`,
      mockNews.find((n) => n._id === params.id)
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
    return forwardToNestJS(request, `/news/${params.id}`);
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
    return forwardToNestJS(request, `/news/${params.id}`);
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
