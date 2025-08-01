interface MediaEnrichment {
  image?: string
  trailer?: string
  preview?: string
  additionalInfo?: any
}

class MediaEnrichmentService {
  constructor() {
    // No external API keys needed anymore
  }

  async enrichRecommendation(item: any, category: string): Promise<MediaEnrichment> {
    // All media enrichment now returns placeholders
    console.log(`🖼️ Using placeholder for ${category}: ${item.name} (external APIs removed)`)
    let width = 200
    let height = 300
    if (category === "music" || category === "food") {
      width = 300
      height = 300
    } else if (category === "places") {
      width = 400
      height = 300
    }

    return {
      image: `/placeholder.svg?height=${height}&width=${width}`,
      trailer: category === "movies" ? "/placeholder.svg" : undefined,
      preview: category === "music" ? "/placeholder.svg" : undefined,
      additionalInfo: {
        source: "placeholder",
      },
    }
  }
}

export const mediaEnrichmentService = new MediaEnrichmentService()
