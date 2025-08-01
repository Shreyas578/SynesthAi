import { type NextRequest, NextResponse } from "next/server"
import { generateRecommendations } from "@/lib/recommendation-service"

export async function POST(request: NextRequest) {
  try {
    const { input, category, type, ratingFilter, languageFilter } = await request.json()

    if (!input || !category) {
      return NextResponse.json({ error: "Input and category are required" }, { status: 400 })
    }

    const { recommendations, fromLLM, filtersAppliedButNoMatch } = await generateRecommendations(
      input,
      category,
      type,
      ratingFilter,
      languageFilter,
    )

    return NextResponse.json({ recommendations, fromLLM, filtersAppliedButNoMatch })
  } catch (error) {
    console.error("Error generating recommendations:", error)
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}
