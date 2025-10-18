"use client"

import { useState } from "react"
import { explorePhotos } from "../data/posts"
import { X, Heart } from "lucide-react"

export default function Explore() {
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  return (
    <div className="p-4">
      {/* Masonry Grid */}
      <div className="columns-2 md:columns-3 gap-1">
        {explorePhotos.map((photo) => (
          <div
            key={photo.id}
            className="relative mb-1 cursor-pointer group overflow-hidden"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img src={photo.image || "/placeholder.svg"} alt="Explore" className="w-full h-auto object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-white">
                <Heart className="w-6 h-6 fill-white" />
                <span className="font-semibold">{photo.likes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedPhoto.image || "/placeholder.svg"}
            alt="Selected"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
