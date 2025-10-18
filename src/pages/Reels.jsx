"use client"

import { useRef, useEffect, useState } from "react"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Volume2, VolumeX } from "lucide-react"
import { reels } from "../data/posts"
import { useApp } from "../context/AppContext"

function ReelCard({ reel, isActive }) {
  const videoRef = useRef(null)
  const [isMuted, setIsMuted] = useState(true)
  const { toggleLike } = useApp()

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }, [isActive])

  return (
    <div className="relative h-screen w-full snap-start snap-always">
      <video ref={videoRef} src={reel.video} loop muted={isMuted} playsInline className="w-full h-full object-cover" />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50">
        {/* Top */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="text-white font-semibold">Reels</span>
          <button className="text-white p-2">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-20 left-4 right-20">
          <div className="flex items-center gap-2 mb-3">
            <img
              src={reel.userAvatar || "/placeholder.svg"}
              alt={reel.username}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-white font-semibold">{reel.username}</span>
            <button className="text-white border border-white px-3 py-1 rounded-md text-sm font-semibold">
              Follow
            </button>
          </div>
          <p className="text-white text-sm">{reel.caption}</p>
        </div>

        {/* Right Actions */}
        <div className="absolute bottom-20 right-4 flex flex-col gap-6">
          <button onClick={() => toggleLike(reel.id)} className="flex flex-col items-center">
            <Heart className="w-7 h-7 text-white" fill={reel.isLiked ? "white" : "none"} />
            <span className="text-white text-xs mt-1">{reel.likes.toLocaleString()}</span>
          </button>
          <button className="flex flex-col items-center">
            <MessageCircle className="w-7 h-7 text-white" />
            <span className="text-white text-xs mt-1">{reel.comments}</span>
          </button>
          <button className="flex flex-col items-center">
            <Send className="w-7 h-7 text-white" />
          </button>
          <button className="flex flex-col items-center">
            <Bookmark className="w-7 h-7 text-white" />
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className="flex flex-col items-center">
            {isMuted ? <VolumeX className="w-7 h-7 text-white" /> : <Volume2 className="w-7 h-7 text-white" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Reels() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const newIndex = Math.round(scrollPosition / windowHeight)
      setActiveIndex(newIndex)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
      {reels.map((reel, index) => (
        <ReelCard key={reel.id} reel={reel} isActive={index === activeIndex} />
      ))}
    </div>
  )
}
