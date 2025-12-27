import { DataUtil } from "../utils/DataUtil"
import { Heart, ChevronLeft, ChevronRight, MoreHorizontal, MessageCircle, Send, Bookmark } from "lucide-react"
import { useDispatch } from "react-redux"
import { useState } from "react"
import { toggleLikeOptimistic } from "../redux/features/post/postSlice"
import { Post } from "../types/post.type"
import { toggleSavePost } from "../redux/features/user/userSlice"
import { useNavigate } from "react-router-dom"
import { PostService } from "../service/postService"

interface PostCardProps {
  post: Post;
  onPostClick?: (post: Post) => void;
}

export default function PostCard({ post, onPostClick }: PostCardProps) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showFullCaption, setShowFullCaption] = useState(false)
  const [isSaved, setIsSaved] = useState(post.isSaved ?? false)

  const hasMedia = post.media && post.media.length > 0
  const isMultiple = (post.media?.length ?? 0) > 1

  const captionLimit = 100
  const needsTruncate = (post.caption?.length ?? 0) > captionLimit

  const next = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % post.media.length)
  }

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === 0 ? post.media.length - 1 : prev - 1))
  }

  const handleCardClick = () => {
    if (onPostClick) {
      onPostClick(post)
    }
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(toggleLikeOptimistic(post.id))
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const originalIsSaved = isSaved
    const newIsSaved = !originalIsSaved

    setIsSaved(newIsSaved)
    
    dispatch(toggleSavePost({ postId: post.id, isSaved: newIsSaved }))

    try {
      await PostService.save(post.id)
      console.log('Save post:', post.id, newIsSaved)
    } catch (err) {
      console.error("Save API failed", err)
      // Rollback on error
      setIsSaved(originalIsSaved)
      dispatch(toggleSavePost({ postId: post.id, isSaved: originalIsSaved }))
    }
  }

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const userId = post.userId || post.username
    navigate(`/profile/${userId}`)
  }

  const toggleCaption = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowFullCaption(!showFullCaption)
  }

  return (
    <article className="bg-white mb-6 cursor-pointer" onClick={handleCardClick}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleProfileClick}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-white p-[2px]">
              <img
                src={post.userAvatar || `https://ui-avatars.com/api/?name=${post.username}&background=random`}
                alt={post.username}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm hover:text-gray-600">{post.username}</span>
            {post.createdDate && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500 text-xs">{DataUtil.timeAgo(post.createdDate)}</span>
              </>
            )}
          </div>
        </div>
        <button className="p-2 hover:text-gray-500" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Media Carousel */}
      <div className="relative bg-black aspect-square border-y border-gray-200">
        {!hasMedia ? (
          <div className="flex items-center justify-center h-full text-white">No media</div>
        ) : (
          <>
            {post.media[currentIndex].type === "video" ? (
              <video
                src={post.media[currentIndex].url}
                controls
                className="w-full h-full object-cover"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                src={post.media[currentIndex].url}
                alt={post.caption || "Post media"}
                className="w-full h-full object-cover"
              />
            )}

            {/* Navigation Buttons */}
            {isMultiple && currentIndex > 0 && (
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow-md transition"
              >
                <ChevronLeft size={16} />
              </button>
            )}

            {isMultiple && currentIndex < post.media.length - 1 && (
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow-md transition"
              >
                <ChevronRight size={16} />
              </button>
            )}

            {/* Dots Indicator */}
            {isMultiple && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {post.media.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition ${
                      idx === currentIndex ? "bg-blue-500" : "bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <button onClick={handleLike} className="hover:text-gray-500 transition flex items-center gap-2">
              <Heart
                size={24}
                fill={post.isLiked ? "#ed4956" : "none"}
                color={post.isLiked ? "#ed4956" : "currentColor"}
                strokeWidth={post.isLiked ? 0 : 2}
              />
              {post.likeCount != null && post.likeCount > 0 && (
                <span className="text-sm font-semibold">{DataUtil.formatlikeCount(post.likeCount)}</span>
              )}
            </button>
            <button className="hover:text-gray-500 transition" onClick={(e) => e.stopPropagation()}>
              <MessageCircle size={24} strokeWidth={2} />
            </button>
            <button className="hover:text-gray-500 transition" onClick={(e) => e.stopPropagation()}>
              <Send size={24} strokeWidth={2} />
            </button>
          </div>
          <button onClick={handleSave} className="hover:text-gray-500 transition">
            <Bookmark 
              size={24} 
              fill={isSaved ? "currentColor" : "none"}
              strokeWidth={2} 
            />
          </button>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="text-sm">
            <span className="font-semibold mr-1 cursor-pointer hover:text-gray-600" onClick={handleProfileClick}>
              {post.username}
            </span>
            <span className="text-gray-900">
              {needsTruncate && !showFullCaption 
                ? post.caption.slice(0, captionLimit) + '...' 
                : post.caption
              }
            </span>
            {needsTruncate && (
              <button 
                onClick={toggleCaption}
                className="text-blue-500 ml-1 hover:text-blue-700"
              >
                {showFullCaption ? ' thu gọn' : ' xem thêm'}
              </button>
            )}
          </div>
        )}

        {/* Comment Count */}
        {post.commentsCount != null && post.commentsCount > 0 && (
          <button className="text-sm text-gray-500 mt-1" onClick={(e) => e.stopPropagation()}>
            View all {post.commentsCount} comments
          </button>
        )}
      </div>
    </article>
  )
}