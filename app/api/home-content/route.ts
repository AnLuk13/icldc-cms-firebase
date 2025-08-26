import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { forwardToNestJS } from "@/lib/nestjs-proxy";

const mockData = {
  id: "1",
  heroTitle: {
    ro: "Bine ați venit pe site-ul nostru",
    ru: "Добро пожаловать на наш сайт",
    en: "Welcome to our website",
  },
  heroSubtitle: {
    ro: "Soluții inovatoare pentru afacerea ta",
    ru: "Инновационные решения для вашего бизнеса",
    en: "Innovative solutions for your business",
  },
  heroDescription: {
    ro: "Oferim servicii de înaltă calitate și soluții personalizate pentru a vă ajuta să vă atingeți obiectivele de afaceri.",
    ru: "Мы предлагаем высококачественные услуги и индивидуальные решения, чтобы помочь вам достичь ваших бизнес-целей.",
    en: "We provide high-quality services and customized solutions to help you achieve your business goals.",
  },
  aboutTitle: {
    ro: "Despre noi",
    ru: "О нас",
    en: "About us",
  },
  aboutContent: {
    ro: "Suntem o echipă dedicată de profesioniști cu experiență vastă în domeniu. Ne concentrăm pe livrarea de soluții de calitate superioară care depășesc așteptările clienților noștri.",
    ru: "Мы - преданная команда профессионалов с обширным опытом в отрасли. Мы сосредоточены на предоставлении высококачественных решений, которые превосходят ожидания наших клиентов.",
    en: "We are a dedicated team of professionals with extensive industry experience. We focus on delivering superior quality solutions that exceed our clients' expectations.",
  },
  metaTitle: {
    ro: "Acasă - Compania Noastră",
    ru: "Главная - Наша Компания",
    en: "Home - Our Company",
  },
  metaDescription: {
    ro: "Descoperiți serviciile noastre de înaltă calitate și soluțiile personalizate pentru afacerea dumneavoastră.",
    ru: "Откройте для себя наши высококачественные услуги и индивидуальные решения для вашего бизнеса.",
    en: "Discover our high-quality services and customized solutions for your business.",
  },
  heroImage: "",
  aboutImage: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export async function GET(request: NextRequest) {
  return forwardToNestJS(request, "/home-content", mockData);
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    return forwardToNestJS(request, "/home-content");
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
    return forwardToNestJS(request, "/home-content");
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
