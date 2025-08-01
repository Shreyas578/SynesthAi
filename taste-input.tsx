"use client"

import { useState } from "react"
import type { Category } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Search, Sparkles } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TasteInputProps {
  category: Category
  onSubmit: (input: string, type: "specific" | "genre", ratingFilter?: number, languageFilter?: string) => void
  onBack: () => void
  loading: boolean
}

const genreOptions = {
  movies: ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Romance", "Animation"],
  music: ["Pop", "Rock", "Hip-Hop", "Jazz", "Classical", "Electronic", "Country", "R&B"],
  books: ["Fiction", "Mystery", "Fantasy", "Biography", "Self-Help", "History", "Science", "Romance"],
  places: ["Beach", "Mountains", "Cities", "Historical", "Adventure", "Relaxation", "Cultural", "Nature"],
  food: ["Italian", "Asian", "Mexican", "Mediterranean", "Vegetarian", "Desserts", "Street Food", "Fine Dining"],
  fashion: ["Casual", "Formal", "Streetwear", "Vintage", "Minimalist", "Bohemian", "Athletic", "Luxury"],
  games: ["Action", "RPG", "Strategy", "Indie", "Puzzle", "Adventure", "Simulation", "Sports"],
  art: ["Impressionism", "Modern", "Abstract", "Renaissance", "Pop Art", "Surrealism", "Minimalism", "Street Art"],
  mood: [
    "Cozy nights",
    "Road trips",
    "Dark academia",
    "Summer vibes",
    "Rainy days",
    "Adventure",
    "Relaxation",
    "Energetic",
  ],
}

const languageOptions = ["English", "Spanish", "French", "German", "Japanese", "Korean", "Hindi", "Mandarin"]

export function TasteInput({ category, onSubmit, onBack, loading }: TasteInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [inputType, setInputType] = useState<"specific" | "genre">("specific")
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined)
  const [languageFilter, setLanguageFilter] = useState<string | undefined>(undefined)

  const handleSubmit = async () => {
    if (inputValue.trim()) {
      onSubmit(inputValue.trim(), inputType, ratingFilter, languageFilter)
    }
  }

  const handleGenreSelect = (genre: string) => {
    setInputValue(genre)
    setInputType("genre")
  }

  const categoryEmojis = {
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

  const placeholderExamples = {
    movies: "Inception, The Matrix, Dune",
    music: "Taylor Swift, Jazz, Lo-fi",
    books: "Harry Potter, Mystery novels, Sci-fi",
    places: "Tokyo, Beach destinations, Mountains",
    food: "Sushi, Italian cuisine, Street food",
    fashion: "Minimalist style, Vintage fashion, Streetwear",
    games: "Zelda, GTA, Indie games",
    art: "Van Gogh, Impressionism, Modern art",
    mood: "Cozy nights, Road trips, Dark academia",
  }

  const showLanguageFilter = category === "movies" || category === "music"

  return (
    <div className="max-w-2xl mx-auto">
      <Button onClick={onBack} variant="ghost" className="mb-6 text-gray-400 hover:text-white">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Categories
      </Button>

      <Card className="bg-gray-800/50 border-gray-700 p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{categoryEmojis[category]}</div>
          <h2 className="text-2xl font-bold mb-2 capitalize">Tell us about your {category} taste</h2>
          <p className="text-gray-400">Enter something specific you love, or choose a genre below</p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder={`e.g., ${placeholderExamples[category]}`}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                setInputType("specific")
              }}
              className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 h-12"
              onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rating-filter" className="text-gray-400">
                Minimum Rating (0-10)
              </Label>
              <Input
                id="rating-filter"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={ratingFilter === undefined ? "" : ratingFilter}
                onChange={(e) => {
                  const value = Number.parseFloat(e.target.value)
                  setRatingFilter(isNaN(value) ? undefined : value)
                }}
                className="mt-1 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                placeholder="e.g., 7.5"
              />
            </div>

            {showLanguageFilter && (
              <div>
                <Label htmlFor="language-filter" className="text-gray-400">
                  Language
                </Label>
                <Select onValueChange={setLanguageFilter} value={languageFilter}>
                  <SelectTrigger className="mt-1 bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="undefined">Any Language</SelectItem>
                    {languageOptions.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="text-center text-gray-400">
            <span>or choose a {category === "mood" ? "vibe" : category === "art" ? "style" : "genre"}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {genreOptions[category].map((genre) => (
              <Button
                key={genre}
                onClick={() => handleGenreSelect(genre)}
                variant="outline"
                className={`
                  border-gray-600 hover:border-pink-500/50 hover:bg-pink-500/10
                  ${
                    inputValue === genre && inputType === "genre"
                      ? "border-pink-500 bg-pink-500/20 text-pink-400"
                      : "text-gray-300"
                  }
                `}
              >
                {genre}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!inputValue.trim() || loading}
            className="w-full h-12 bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-medium"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating AI Recommendations...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get My Recommendations
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
