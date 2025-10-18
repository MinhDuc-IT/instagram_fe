"use client"

import { useState } from "react"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Smile } from "lucide-react"
import { useApp } from "../context/AppContext"
import { motion } from "framer-motion"

export default function PostCard({ post }) {
  const { toggleLike, toggleSave, addComment } = useApp()
  const [commentText, setCommentText] = useState("")
  const [showComments, setShowComments] = useState(false)
  const [showHeart, setShowHeart] = useState(false)

  const handleLike = () => {
    toggleLike(post.id)
  }

  const handleDoubleTap = () => {
    if (!post.isLiked) {
      toggleLike(post.id)
    }
    setShowHeart(true)
    setTimeout(() => setShowHeart(false), 1000)
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (commentText.trim()) {
      addComment(post.id, commentText)
      setCommentText("")
    }
  }

  return (
    <article className="card mb-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <img
            src={post.userAvatar || "/placeholder.svg"}
            alt={post.username}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-semibold text-sm">{post.username}</span>
          <span className="text-gray-500 text-sm">• {post.timestamp}</span>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Image */}
      <div className="relative" onDoubleClick={handleDoubleTap}>
        <img src={post.image || "/placeholder.svg"} alt="Post" className="w-full aspect-square object-cover" />
        {showHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg" />
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="hover:text-gray-500 transition-colors">
              <Heart
                className="w-6 h-6"
                fill={post.isLiked ? "currentColor" : "none"}
                color={post.isLiked ? "#ed4956" : "currentColor"}
              />
            </button>
            <button onClick={() => setShowComments(!showComments)} className="hover:text-gray-500 transition-colors">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="hover:text-gray-500 transition-colors">
              <Send className="w-6 h-6" />
            </button>
          </div>
          <button onClick={() => toggleSave(post.id)} className="hover:text-gray-500 transition-colors">
            <Bookmark className="w-6 h-6" fill={post.isSaved ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Likes */}
        <div className="font-semibold text-sm">{post.likes.toLocaleString()} likes</div>

        {/* Caption */}
        <div className="text-sm">
          <span className="font-semibold mr-2">{post.username}</span>
          <span>{post.caption}</span>
        </div>

        {/* Comments */}
        {post.comments.length > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            View all {post.comments.length} comments
          </button>
        )}

        {showComments && (
          <div className="space-y-2 pt-2">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2">
                <img
                  src={comment.avatar || "/placeholder.svg"}
                  alt={comment.username}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div className="text-sm">
                  <span className="font-semibold mr-2">{comment.username}</span>
                  <span>{comment.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Comment */}
        <form
          onSubmit={handleAddComment}
          className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-800"
        >
          <Smile className="w-6 h-6 text-gray-500" />
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
          />
          {commentText && (
            <button type="submit" className="text-ig-primary font-semibold text-sm">
              Post
            </button>
          )}
        </form>
      </div>
    </article>
  )
}
