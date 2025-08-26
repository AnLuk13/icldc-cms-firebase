import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forwardToNestJS } from "@/lib/nestjs-proxy";

// Mock data - fallback when NestJS is not available
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
  {
    _id: "2",
    name: {
      en: "New Partnership Announcement",
      ro: "Anunțul Noului Parteneriat",
      ru: "Объявление о новом партнерстве",
    },
    content: {
      en: "We are excited to announce our new strategic partnership with Innovation Hub, a leading technology incubator. This collaboration will bring new opportunities for innovation and growth to our organization and the broader community.",
      ro: "Suntem încântați să anunțăm noul nostru parteneriat strategic cu Innovation Hub, un incubator tehnologic de frunte. Această colaborare va aduce noi oportunități de inovare și creștere pentru organizația noastră și comunitatea mai largă.",
      ru: "Мы рады объявить о нашем новом стратегическом партнерстве с Innovation Hub, ведущим технологическим инкубатором. Это сотрудничество принесет новые возможности для инноваций и роста нашей организации и более широкому сообществу.",
    },
    summary: {
      en: "Strategic partnership with Innovation Hub announced",
      ro: "Anunțat parteneriatul strategic cu Innovation Hub",
      ru: "Объявлено стратегическое партнерство с Innovation Hub",
    },
    author: "Communications Team",
    documents: [],
    category: "Partnerships",
    tags: ["partnership", "innovation", "collaboration"],
    publishedAt: new Date("2024-02-10T14:30:00"),
    bannerImage: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "3",
    name: {
      en: "Upcoming Community Workshop",
      ro: "Viitorul Atelier Comunitar",
      ru: "Предстоящий общественный семинар",
    },
    content: {
      en: "Join us for our upcoming Digital Skills Workshop designed to help community members develop essential digital literacy skills. The workshop will cover basic computer skills, internet safety, and digital communication tools.",
      ro: "Alăturați-vă nouă pentru viitorul nostru Atelier de Competențe Digitale conceput pentru a ajuta membrii comunității să dezvolte competențe esențiale de alfabetizare digitală. Atelierul va acoperi competențe de bază de calculator, siguranța pe internet și instrumente de comunicare digitală.",
      ru: "Присоединяйтесь к нам на предстоящем семинаре по цифровым навыкам, предназначенном для помощи членам сообщества в развитии основных навыков цифровой грамотности. Семинар будет охватывать базовые компьютерные навыки, безопасность в интернете и инструменты цифрового общения.",
    },
    author: "Community Team",
    documents: [],
    category: "Events",
    tags: ["workshop", "community", "digital skills"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    return forwardToNestJS(request, "/news", mockNews);
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    return forwardToNestJS(request, "/news");
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
