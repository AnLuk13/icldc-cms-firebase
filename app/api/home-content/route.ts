import { type NextRequest, NextResponse } from "next/server"
import type { HomeContent } from "@/lib/types"

// In a real application, this would connect to your database
let homeContentData: HomeContent | null = null

export async function GET() {
  try {
    // Return default content if none exists
    const defaultContent: HomeContent = {
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
    }

    return NextResponse.json(homeContentData || defaultContent)
  } catch (error) {
    console.error("Error fetching home content:", error)
    return NextResponse.json({ error: "Failed to fetch home content" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      "heroTitle",
      "heroSubtitle",
      "heroDescription",
      "aboutTitle",
      "aboutContent",
      "metaTitle",
      "metaDescription",
    ]
    for (const field of requiredFields) {
      if (!body[field] || !body[field].ro || !body[field].ru || !body[field].en) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const homeContent: HomeContent = {
      id: homeContentData?.id || "1",
      heroTitle: body.heroTitle,
      heroSubtitle: body.heroSubtitle,
      heroDescription: body.heroDescription,
      aboutTitle: body.aboutTitle,
      aboutContent: body.aboutContent,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      heroImage: body.heroImage || "",
      aboutImage: body.aboutImage || "",
      createdAt: homeContentData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In a real application, save to database
    homeContentData = homeContent

    return NextResponse.json(homeContent)
  } catch (error) {
    console.error("Error saving home content:", error)
    return NextResponse.json({ error: "Failed to save home content" }, { status: 500 })
  }
}
