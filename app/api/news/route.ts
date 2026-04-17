import { type NextRequest, NextResponse } from "next/server";
import { requireAdminOrEditor } from "@/lib/auth";
import { getNews, createNews } from "@/lib/services/news";

export async function GET(request: NextRequest) {
  const { error, status } = await requireAdminOrEditor(request);
  if (error) return NextResponse.json({ message: error }, { status });
  try {
    const news = await getNews();
    return NextResponse.json(news);
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const { error, status } = await requireAdminOrEditor(request);
  if (error) return NextResponse.json({ message: error }, { status });
  try {
    const body = await request.json();
    const item = await createNews(body);
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
