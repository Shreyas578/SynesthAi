"use client"

import type { Category, Recommendation } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Star, Info } from "lucide-react"
import Image from "next/image"

interface ResultsGalleryProps {
  recommendations: Recommendation[]
  onItemClick: (item: Recommendation) => void
  onBack: () => void
  category: Category
}

export function ResultsGallery({ recommendations, onItemClick, onBack, category }: ResultsGalleryProps) {
  const categoryEmojis = {
    movies: "🎬",
    music: "🎧",
    books: "📖",
    places: "📍",
    food: "🍱",
    fashion: "👕",
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Button onClick={onBack} variant="ghost" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Input
        </Button>

        <div className="text-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">{categoryEmojis[category]}</span>
            Recommendations for You
          </h2>
        </div>

        <div></div>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold mb-2">No recommendations found</h3>
          <p className="text-gray-400">Try a different search term or genre</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((item) => (
            <Card
              key={item.id}
              className="bg-gray-800/50 border-gray-700 overflow-hidden hover:border-pink-500/50 transition-all duration-300 transform hover:scale-105 cursor-pointer group"
              onClick={() => onItemClick(item)}
            >
              <div className="relative">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Button
                  size="sm"
                  className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-pink-500/80 hover:bg-pink-500"
                >
                  <Info className="w-4 h-4 mr-1" />
                  More Info
                </Button>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{item.name}</h3>

                {item.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-300">{item.rating}</span>
                  </div>
                )}

                <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
