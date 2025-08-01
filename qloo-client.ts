interface QlooEntity {
  id: string
  name: string
  type: string
  metadata?: {
    year?: number
    genre?: string[]
    rating?: number
    description?: string
  }
}

interface QlooTag {
  tag_id: string
  name: string
  types: string[]
  subtype: string
  tag_value: string
  query: Record<string, any>
}

interface QlooResponse {
  success: boolean
  results: {
    entities?: QlooEntity[]
    tags?: QlooTag[]
  }
  warnings?: Array<{
    type: string
    parameter: string
    message: string
  }>
  duration: number
}

interface QlooRecommendation {
  id: string
  name: string
  type: string
  year?: number
  genre?: string[]
  rating?: number
  description?: string
}

interface TasteInsightsParams {
  tagTypes?: string // e.g., "urn:tag:keyword:media"
  parentTypes?: string // e.g., "urn:entity:movie,urn:entity:tv_show"
  signalAudiences?: string // e.g., "urn:audience:millennials"
  signalInterestsEntities?: string // e.g., "urn:entity:movie:inception"
  signalInterestsTags?: string // e.g., "urn:tag:genre:sci-fi"
  location?: string // e.g., "New York"
  locationQuery?: string // e.g., "Eiffel Tower"
  limit?: number
}

class QlooClient {
  private apiKey: string
  private baseUrl: string
  private allowedEntityTypes: Set<string>

  constructor() {
    this.apiKey = process.env.QLOO_API_KEY || ""
    this.baseUrl = "https://hackathon.api.qloo.com"
    this.allowedEntityTypes = new Set(["movie", "place", "restaurant", "music", "book", "game", "person"])
  }

  async getRecommendations(
    input: string,
    category: string,
    type: "specific" | "genre" = "specific",
  ): Promise<{ recommendations: QlooRecommendation[]; fromMock: boolean }> {
    try {
      if (!this.apiKey) {
        console.error("❌ QLOO_API_KEY not found in environment variables")
        // Fallback to mock data if API key is missing
        return { recommendations: this.getMockRecommendations(input, category), fromMock: true }
      }

      const qlooCategory = this.mapCategoryToQloo(category)
      console.log(`🎯 Getting recommendations for: "${input}" (${category} -> ${qlooCategory})`)

      const approaches = []
      if (type === "specific") {
        approaches.push(
          () => this.searchByName(input, qlooCategory),
          () => this.searchByInterests(input, qlooCategory),
          () => this.searchWithContext(input, qlooCategory),
        )
      } else {
        approaches.push(
          () => this.searchByTags(input, qlooCategory),
          () => this.searchWithGenreContext(input, qlooCategory),
        )
      }
      // Always include a general search as a last resort
      approaches.push(() => this.searchGeneral(qlooCategory))

      for (const approach of approaches) {
        try {
          const results = await approach()
          if (results.length > 0) {
            console.log(`✅ Found ${results.length} results using a successful approach.`)
            return { recommendations: results, fromMock: false }
          }
        } catch (error) {
          console.log(`⚠️ Approach failed, trying next...`)
          continue
        }
      }

      console.log(
        `⚠️ No recommendations found from Qloo API for "${input}" in ${category} after trying all strategies. Falling back to mock data.`,
      )
      return { recommendations: this.getMockRecommendations(input, category), fromMock: true }
    } catch (error) {
      console.error("❌ Qloo API error in getRecommendations:", error)
      console.log(`⚠️ An unexpected error occurred with Qloo API. Falling back to mock data.`)
      return { recommendations: this.getMockRecommendations(input, category), fromMock: true }
    }
  }

  async searchByName(input: string, entityType: string): Promise<QlooRecommendation[]> {
    const endpoint = `${this.baseUrl}/v2/insights/`
    const queryParams = new URLSearchParams({
      "filter.type": `urn:entity:${entityType}`,
      "filter.name": input,
      limit: "6",
    })
    return this.makeEntityRequest(`${endpoint}?${queryParams.toString()}`, "name search")
  }

  async searchByInterests(input: string, entityType: string): Promise<QlooRecommendation[]> {
    const endpoint = `${this.baseUrl}/v2/insights/`
    const queryParams = new URLSearchParams({
      "filter.type": `urn:entity:${entityType}`,
      "signal.interests.query": input,
      limit: "6",
    })
    return this.makeEntityRequest(`${endpoint}?${queryParams.toString()}`, "interests search")
  }

  async searchByTags(input: string, entityType: string): Promise<QlooRecommendation[]> {
    const endpoint = `${this.baseUrl}/v2/insights/`
    const queryParams = new URLSearchParams({
      "filter.type": `urn:entity:${entityType}`,
      "filter.tags": input,
      limit: "6",
    })
    return this.makeEntityRequest(`${endpoint}?${queryParams.toString()}`, "tags search")
  }

  async searchWithContext(input: string, entityType: string): Promise<QlooRecommendation[]> {
    const endpoint = `${this.baseUrl}/v2/insights/`
    const queryParams = new URLSearchParams({
      "filter.type": `urn:entity:${entityType}`,
      "signal.interests.query": input,
      "signal.context.time": "recent",
      "signal.context.popularity": "trending",
      limit: "6",
    })
    return this.makeEntityRequest(`${endpoint}?${queryParams.toString()}`, "context search")
  }

  async searchWithGenreContext(input: string, entityType: string): Promise<QlooRecommendation[]> {
    const endpoint = `${this.baseUrl}/v2/insights/`
    const queryParams = new URLSearchParams({
      "filter.type": `urn:entity:${entityType}`,
      "filter.tags": input,
      "signal.context.time": "recent",
      limit: "6",
    })
    return this.makeEntityRequest(`${endpoint}?${queryParams.toString()}`, "genre context search")
  }

  // Simplified searchGeneral to use only filter.type and signal.context.popularity=trending
  async searchGeneral(entityType: string): Promise<QlooRecommendation[]> {
    const endpoint = `${this.baseUrl}/v2/insights/`
    const queryParams = new URLSearchParams({
      "filter.type": `urn:entity:${entityType}`,
      "signal.context.popularity": "trending", // This is a valid primary signal for general trending
      limit: "6",
    })
    return this.makeEntityRequest(`${endpoint}?${queryParams.toString()}`, "general trending search")
  }

  private async makeEntityRequest(url: string, searchType: string): Promise<QlooRecommendation[]> {
    console.log(`📡 ${searchType}: ${url}`)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Api-Key": this.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "SynesthAI/1.0",
      },
    })

    console.log(`📊 ${searchType} response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ ${searchType} error: ${response.status} - ${errorText}`)
      throw new Error(`${searchType} failed: ${response.status} - ${errorText}`)
    }

    const data: QlooResponse = await response.json()
    console.log(`✅ ${searchType} response:`, JSON.stringify(data, null, 2))

    if (data.warnings && data.warnings.length > 0) {
      data.warnings.forEach((warning) => {
        console.log(`⚠️ API Warning: ${warning.message}`)
      })
    }

    const results = this.parseEntityResponse(data)

    if (results.length === 0) {
      console.log(`⚠️ ${searchType} returned no entity results`)
      throw new Error(`${searchType} returned no entity results`)
    }

    return results
  }

  private parseEntityResponse(data: QlooResponse): QlooRecommendation[] {
    if (!data.results || !data.results.entities || !Array<QlooEntity>(data.results.entities)) {
      console.log("⚠️ Unexpected entity response format:", JSON.stringify(data, null, 2))
      return []
    }

    return data.results.entities.map((item, index) => ({
      id: item.id || `entity_${index}`,
      name: item.name || `Recommendation ${index + 1}`,
      type: this.mapQlooToCategory(item.type.replace("urn:entity:", "")),
      year: item.metadata?.year,
      genre: item.metadata?.genre,
      rating: item.metadata?.rating || Math.random() * 2 + 7,
      description: item.metadata?.description || `A great recommendation for you.`,
    }))
  }

  async getTasteInsights(params: TasteInsightsParams): Promise<QlooTag[]> {
    try {
      if (!this.apiKey) {
        console.error("❌ QLOO_API_KEY not found in environment variables")
        throw new Error("QLOO_API_KEY not configured")
      }

      const endpoint = `${this.baseUrl}/v2/insights/`
      const queryParams = new URLSearchParams({
        "filter.type": "urn:tag",
        limit: String(params.limit || 20),
      })

      if (params.tagTypes) queryParams.set("filter.tag.types", params.tagTypes)
      if (params.parentTypes) queryParams.set("filter.parents.types", params.parentTypes)
      if (params.signalAudiences) queryParams.set("signal.demographics.audiences", params.signalAudiences)
      if (params.signalInterestsEntities) queryParams.set("signal.interests.entities", params.signalInterestsEntities)
      if (params.signalInterestsTags) queryParams.set("signal.interests.tags", params.signalInterestsTags)
      if (params.location) queryParams.set("signal.location", params.location)
      if (params.locationQuery) queryParams.set("signal.location.query", params.locationQuery)

      const fullUrl = `${endpoint}?${queryParams.toString()}`
      console.log(`📡 Taste Insights Request: ${fullUrl}`)

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          "X-Api-Key": this.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "SynesthAI/1.0",
        },
      })

      console.log(`📊 Taste Insights response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Taste Insights error: ${response.status} - ${errorText}`)
        throw new Error(`Taste Insights failed: ${response.status} - ${errorText}`)
      }

      const data: QlooResponse = await response.json()
      console.log(`✅ Taste Insights response:`, JSON.stringify(data, null, 2))

      if (data.warnings && data.warnings.length > 0) {
        data.warnings.forEach((warning) => {
          console.log(`⚠️ API Warning: ${warning.message}`)
        })
      }

      const results = this.parseTagResponse(data)

      if (results.length === 0) {
        console.log(`⚠️ Taste Insights returned no tags`)
        throw new Error(`Taste Insights returned no tags for the given parameters.`)
      }

      return results
    } catch (error) {
      console.error("❌ Qloo API error in getTasteInsights:", error)
      throw error
    }
  }

  private parseTagResponse(data: QlooResponse): QlooTag[] {
    if (!data.results || !data.results.tags || !Array<QlooTag>(data.results.tags)) {
      console.log("⚠️ Unexpected tag response format:", JSON.stringify(data, null, 2))
      return []
    }
    return data.results.tags
  }

  async testConnection(): Promise<{ success: boolean; message: string; availableTypes?: string[] }> {
    try {
      if (!this.apiKey) {
        return { success: false, message: "QLOO_API_KEY not configured" }
      }

      const testUrl = `${this.baseUrl}/v2/insights/?filter.type=urn:entity:movie&signal.context.popularity=trending&limit=1`
      console.log(`🧪 Testing connection to: ${testUrl}`)

      const testResponse = await fetch(testUrl, {
        method: "GET",
        headers: {
          "X-Api-Key": this.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      console.log(`🧪 Test response status: ${testResponse.status}`)

      if (testResponse.ok) {
        const data = await testResponse.json()
        const resultCount = data.results?.entities?.length || 0
        if (resultCount > 0) {
          return {
            success: true,
            message: `Qloo API working! Found ${resultCount} trending movies.`,
          }
        } else {
          return {
            success: false,
            message: "Qloo API connected but returned no entity results. Check your API permissions.",
          }
        }
      } else {
        const errorText = await testResponse.text()
        return { success: false, message: `Qloo API returned status: ${testResponse.status} - ${errorText}` }
      }
    } catch (error) {
      return { success: false, message: `Qloo API connection failed: ${error}` }
    }
  }

  private mapCategoryToQloo(category: string): string {
    const categoryMap: Record<string, string> = {
      movies: "movie",
      music: "music",
      books: "book",
      places: "place",
      food: "restaurant",
      fashion: "fashion",
      games: "game",
      art: "person", // Artists are often represented as persons in Qloo
      mood: "music", // Moods often relate to music/playlists, or could be a custom tag type
    }
    return categoryMap[category] || category
  }

  private mapQlooToCategory(qlooType: string): string {
    const categoryMap: Record<string, string> = {
      movie: "movies",
      music: "music",
      book: "books",
      place: "places",
      restaurant: "food",
      fashion: "fashion",
      game: "games",
      person: "art",
    }
    return categoryMap[qlooType] || qlooType
  }

  private getMockRecommendations(input: string, category: string): QlooRecommendation[] {
    console.log(`🎭 Generating mock recommendations for: ${input} (${category})`)

    const mockData: Record<string, QlooRecommendation[]> = {
      movies: [
        {
          id: "movie_mock_1",
          name: "The Matrix",
          type: "movie",
          year: 1999,
          genre: ["Sci-Fi", "Action"],
          rating: 8.7,
          description: "A computer hacker learns from mysterious rebels about the true nature of his reality.",
        },
        {
          id: "movie_mock_2",
          name: "Inception",
          type: "movie",
          year: 2010,
          genre: ["Sci-Fi", "Action", "Thriller"],
          rating: 8.8,
          description: "A thief who steals information by entering people's dreams is given the inverse task.",
        },
        {
          id: "movie_mock_3",
          name: "Dune",
          type: "movie",
          year: 2021,
          genre: ["Sci-Fi", "Adventure", "Drama"],
          rating: 8.0,
          description:
            "A gifted young man must travel to the most dangerous planet in the universe to ensure the future of his family and his people.",
        },
      ],
      music: [
        {
          id: "music_mock_1",
          name: "Blinding Lights",
          type: "song",
          genre: ["Pop", "Synthwave"],
          rating: 8.5,
          description: "A hit song by The Weeknd, known for its retro-futuristic sound.",
        },
        {
          id: "music_mock_2",
          name: "Daft Punk",
          type: "artist",
          genre: ["Electronic", "House"],
          rating: 9.0,
          description: "Iconic French electronic music duo.",
        },
      ],
      books: [
        {
          id: "book_mock_1",
          name: "1984",
          type: "book",
          year: 1949,
          genre: ["Dystopian", "Sci-Fi"],
          rating: 8.6,
          description: "George Orwell's classic dystopian novel.",
        },
      ],
      places: [
        {
          id: "place_mock_1",
          name: "Tokyo",
          type: "city",
          rating: 9.2,
          description: "A vibrant metropolis blending traditional culture with cutting-edge technology.",
        },
      ],
      food: [
        {
          id: "food_mock_1",
          name: "Sushi",
          type: "cuisine",
          rating: 9.0,
          description: "Traditional Japanese dish of prepared vinegared rice.",
        },
      ],
      fashion: [
        {
          id: "fashion_mock_1",
          name: "Streetwear",
          type: "style",
          rating: 8.0,
          description: "A casual clothing style that became global in the 1990s.",
        },
      ],
      games: [
        {
          id: "game_mock_1",
          name: "The Legend of Zelda: Breath of the Wild",
          type: "game",
          rating: 9.7,
          description: "An open-world action-adventure game developed by Nintendo.",
        },
        {
          id: "game_mock_2",
          name: "Grand Theft Auto V",
          type: "game",
          rating: 9.5,
          description: "An action-adventure game played from either a third-person or first-person perspective.",
        },
      ],
      art: [
        {
          id: "art_mock_1",
          name: "Starry Night",
          type: "painting",
          rating: 9.5,
          description: "An oil on canvas by the Dutch Post-Impressionist painter Vincent van Gogh.",
        },
      ],
      mood: [
        {
          id: "mood_mock_1",
          name: "Lo-fi Beats",
          type: "music_genre",
          rating: 8.0,
          description: "Relaxing instrumental music, often used for studying or chilling.",
        },
      ],
    }

    // Return mock data for the specific category, or a generic set if category not found
    return mockData[category] || mockData.movies // Default to movies mock if category not explicitly handled
  }
}

export const qlooClient = new QlooClient()
