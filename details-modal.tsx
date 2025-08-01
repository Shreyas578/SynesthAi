"use client"

import type { Recommendation } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Star, Play, ExternalLink, Lightbulb } from "lucide-react"
import Image from "next/image"

interface DetailsModalProps {
  item: Recommendation
  onClose: () => void
}

export function DetailsModal({ item, onClose }: DetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-800 border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="w-4 h-4" />
          </Button>

          <Image
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            width={600}
            height={400}
            className="w-full h-64 object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent" />
        </div>

        <div className="p-6 -mt-16 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
              {item.rating && (
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-medium">{item.rating}</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-gray-300 mb-6">{item.description}</p>

          {item.details?.reason && (
            <div className="mb-6 p-4 bg-gradient-to-r from-pink-500/10 to-cyan-500/10 border border-pink-500/20 rounded-lg">
              <h3 className="font-semibold mb-2 text-pink-400">🧠 Why You'll Love This</h3>
              <p className="text-gray-300">{item.details.reason}</p>
            </div>
          )}

          {item.details?.tips && (
            <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-lg">
              <h3 className="font-semibold mb-2 text-cyan-400 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Pro Tip
              </h3>
              <p className="text-gray-300">{item.details.tips}</p>
            </div>
          )}

          {item.details?.summary && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-gray-300">{item.details.summary}</p>
            </div>
          )}

          <div className="flex gap-3">
            {item.details?.trailer && (
              <Button className="flex-1 bg-red-600 hover:bg-red-700">
                <Play className="w-4 h-4 mr-2" />
                Watch Trailer
              </Button>
            )}

            {item.details?.preview && (
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Listen Preview
              </Button>
            )}

            <Button variant="outline" className="border-gray-600 hover:border-gray-500 bg-transparent">
              <ExternalLink className="w-4 h-4 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
