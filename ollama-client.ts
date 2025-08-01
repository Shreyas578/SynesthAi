interface OllamaResponse {
  response: string
  done: boolean
}

// Define the structure for LLM-generated recommendations
export interface LLMRecommendation {
  id: string
  name: string
  category: string
  image: string // This will be a placeholder from LLM, then enriched
  rating: number
  description: string
  details: {
    reason: string
    tips: string
    summary: string
    language?: string // For movies and music
    trailer?: string // For movies
    preview?: string // For music
  }
}

class OllamaClient {
  private baseUrl: string
  private model: string

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434"
    this.model = "gemma:2b" // Explicitly set to gemma:2b
  }

  async generateRecommendations(
    userInput: string,
    category: string,
    type: "specific" | "genre",
  ): Promise<LLMRecommendation[]> {
    const controller = new AbortController()
    // Increased timeout to 5 minutes (300,000 ms) for 10 recommendations
    const timeoutId = setTimeout(() => controller.abort(), 300000)

    try {
      const prompt = this.buildRecommendationPrompt(userInput, category, type)

      console.log("🧠 Sending prompt to Ollama:", prompt)

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 4096, // Increased max_tokens to allow for full JSON output
            num_ctx: 4096,
          },
        }),
        signal: controller.signal, // Attach the abort signal
      })

      clearTimeout(timeoutId) // Clear the timeout if the fetch completes in time

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`)
      }

      const data: OllamaResponse = await response.json()
      console.log("✅ Raw Ollama response:", data.response)

      try {
        const jsonMatch = data.response.match(/```json\n([\s\S]*?)\n```/)
        let jsonString = data.response

        if (jsonMatch && jsonMatch[1]) {
          jsonString = jsonMatch[1]
          console.log("Extracted JSON string from markdown block.")
        } else {
          console.warn("No JSON markdown block found. Attempting to parse raw response.")
        }

        const parsedResponse = JSON.parse(jsonString)

        if (!Array.isArray(parsedResponse)) {
          throw new Error("LLM response is not a JSON array.")
        }
        // Validate the structure of each recommendation
        const validatedRecommendations: LLMRecommendation[] = parsedResponse.map((rec: any, index: number) => {
          if (
            !rec.id ||
            !rec.name ||
            !rec.category ||
            !rec.image ||
            typeof rec.rating !== "number" ||
            !rec.description ||
            !rec.details
          ) {
            console.warn(`Invalid recommendation structure at index ${index}:`, rec)
            throw new Error("Invalid recommendation structure from LLM.")
          }
          return {
            id: rec.id,
            name: rec.name,
            category: rec.category,
            image: rec.image,
            rating: rec.rating,
            description: rec.description,
            details: {
              reason: rec.details.reason || "No reason provided.",
              tips: rec.details.tips || "No tips provided.",
              summary: rec.details.summary || rec.description,
              language: rec.details.language,
              trailer: rec.details.trailer,
              preview: rec.details.preview,
            },
          }
        })
        return validatedRecommendations
      } catch (parseError) {
        console.error("Failed to parse LLM response as JSON or invalid structure:", parseError)
        return this.getFallbackRecommendations(userInput, category)
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.error("Ollama API request timed out (5 minutes). Falling back to generic recommendations.")
      } else {
        console.error("Ollama API error during recommendation generation:", error)
      }
      return this.getFallbackRecommendations(userInput, category)
    } finally {
      clearTimeout(timeoutId) // Ensure timeout is cleared even if an error occurs before it's explicitly cleared
    }
  }

  private buildRecommendationPrompt(userInput: string, category: string, type: "specific" | "genre"): string {
    const categoryEmojis: Record<string, string> = {
      movies: "🎬",
      music: "🎧",
      books: "📖",
      places: "📍",
      food: "🍱",
      fashion: "👕",
      games: "🎮",
      art: "🎨",
      mood: "🧘",
    }

    const emoji = categoryEmojis[category] || "✨"
    const numRecommendations = 5 // Reduced to 5 suggestions for better reliability

    let prompt = `You are SynesthAI, an AI-powered lifestyle discovery assistant. Your task is to generate personalized recommendations based on user input.
The user likes "${userInput}" in the category "${category}" ${emoji}.

Generate exactly ${numRecommendations} recommendations. For each recommendation, provide the name of a **well-known, existing entity** (e.g., a real movie title, a real artist, a real book title).
Each recommendation must include:
- "id": A unique string identifier (e.g., "rec_1", "rec_2").
- "name": The name of the well-known, existing recommendation.
- "category": The category (e.g., "movies", "music", "books").
- "image": A generic placeholder image URL (e.g., "/placeholder.svg?height=300&width=200").
- "rating": A numerical rating between 7.0 and 9.9.
- "description": A concise description (1-2 sentences).
- "details": An object containing:
  - "reason": Why the user will love this, connecting it to "${userInput}" (1-2 sentences).
  - "tips": One practical pro tip for enjoying this recommendation.
  - "summary": A brief summary (1-2 sentences).`

    if (category === "movies" || category === "music") {
      prompt += `
  - "language": The primary language of the content (e.g., "English", "Spanish", "French").`
    }
    if (category === "movies") {
      prompt += `
  - "trailer": A placeholder URL for a trailer (e.g., "https://www.youtube.com/watch?v=dQw4w9WgXcQ").`
    }
    if (category === "music") {
      prompt += `
  - "preview": A placeholder URL for a music preview (e.g., "https://example.com/preview.mp3").`
    }

    prompt += `
Constraints:
- Ensure all fields are present and correctly formatted.
- Ratings must be between 7.0 and 9.9.
- The "name" field MUST be a real, existing, and well-known entity.
- Do NOT include any text outside the JSON array.
- The JSON array MUST be complete and end with a closing ']' character.
- Do NOT include any comments (like //) inside the JSON.
- Wrap the JSON array in a markdown code block like this:
\`\`\`json
[
  { ... },
  { ... }
]
\`\`\`

Generate the JSON array:`
    return prompt
  }

  private getFallbackRecommendations(userInput: string, category: string): LLMRecommendation[] {
    console.log(`🎭 Generating generic fallback recommendations for: ${userInput} (${category})`)
    const baseRec = {
      id: "fallback_1",
      name: `AI Recommended ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      category: category,
      image: `/placeholder.svg?height=300&width=200`,
      rating: 8.0 + Math.random() * 1.5, // Random rating between 8.0 and 9.5
      description: `A highly-rated ${category} recommendation based on your interest in "${userInput}".`,
      details: {
        reason: `This is a popular choice that aligns with general interests in ${category}.`,
        tips: `Explore similar items to broaden your horizons.`,
        summary: `A solid recommendation for any fan of ${category}.`,
      },
    }

    const recommendations: LLMRecommendation[] = []
    // Generate 5 fallback recommendations
    for (let i = 0; i < 5; i++) {
      recommendations.push({
        ...baseRec,
        id: `fallback_${i + 1}`,
        name: `${baseRec.name} ${i + 1}`,
        rating: Number.parseFloat((8.0 + Math.random() * 1.5).toFixed(1)),
        description: `A unique ${category} experience that resonates with your taste in "${userInput}".`,
        details: {
          ...baseRec.details,
          reason: `This recommendation is a great match for your interest in "${userInput}" due to its compelling ${category} elements.`,
          tips: `Consider diving deep into its unique aspects for a richer experience.`,
          summary: `An excellent choice for those who appreciate ${category} with a twist.`,
          language: category === "movies" || category === "music" ? (i % 2 === 0 ? "English" : "Spanish") : undefined,
          trailer: category === "movies" ? "/placeholder.svg" : undefined,
          preview: category === "music" ? "/placeholder.svg" : undefined,
        },
      })
    }
    return recommendations
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      return response.ok
    } catch (error) {
      console.error("Ollama connection test failed:", error)
      return false
    }
  }
}

export const ollamaClient = new OllamaClient()
