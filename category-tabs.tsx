"use client"

import type { Category } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Film, Music, Book, MapPin, UtensilsCrossed, Shirt, Gamepad2, Palette, Heart } from "lucide-react"

interface CategoryTabsProps {
  selectedCategory: Category
  onCategorySelect: (category: Category) => void
}

const categories = [
  { id: "movies" as Category, label: "Movies", icon: Film, emoji: "🎬" },
  { id: "music" as Category, label: "Music", icon: Music, emoji: "🎧" },
  { id: "books" as Category, label: "Books", icon: Book, emoji: "📖" },
  { id: "places" as Category, label: "Places", icon: MapPin, emoji: "📍" },
  { id: "food" as Category, label: "Food", icon: UtensilsCrossed, emoji: "🍱" },
  { id: "fashion" as Category, label: "Fashion", icon: Shirt, emoji: "👕" },
  { id: "games" as Category, label: "Games", icon: Gamepad2, emoji: "🎮" },
  { id: "art" as Category, label: "Art", icon: Palette, emoji: "🎨" },
  { id: "mood" as Category, label: "Mood", icon: Heart, emoji: "🧘" },
]

export function CategoryTabs({ selectedCategory, onCategorySelect }: CategoryTabsProps) {
  return (
    <div className="max-w-5xl mx-auto text-center">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
          Discover Your Next Obsession
        </h1>
        <p className="text-gray-400 text-lg">Choose a category to get AI-powered recommendations across all domains</p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const Icon = category.icon
          const isSelected = selectedCategory === category.id

          return (
            <Button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`
                h-32 flex flex-col items-center justify-center gap-3 text-lg font-medium
                transition-all duration-300 transform hover:scale-105
                ${
                  isSelected
                    ? "bg-gradient-to-br from-pink-500/20 to-cyan-500/20 border-2 border-pink-500/50 shadow-lg shadow-pink-500/25"
                    : "bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50 hover:border-gray-600"
                }
              `}
              variant="ghost"
            >
              <div className="text-3xl mb-1">{category.emoji}</div>
              <Icon className={`w-6 h-6 ${isSelected ? "text-pink-400" : "text-gray-400"}`} />
              <span className={isSelected ? "text-pink-400" : "text-gray-300"}>{category.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
