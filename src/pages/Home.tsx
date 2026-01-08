import { useEffect, useState, useRef, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchHomeFeed, fetchMorePosts } from "../redux/features/post/postSlice"
import { fetchStories, fetchMoreStories, createStoryRequest, shareStoryRequest } from "../redux/features/story/storySlice"
import PostCard from "../components/PostCard"
import PostModal from "../components/PostModal"
import StoryBubble from "../components/story/StoryBubble"
import { RootState } from "../redux/store"
import { Post } from "../types/post.type"
import StorySkeleton from "../components/story/StorySkeleton"
import EmptyStories from "../components/story/EmptyStories"
import AddStoryBubble from "../components/story/AddStoryBubble"
import AddStoryModal from "../components/story/AddStoryModal"
import StoryViewerModal from "../components/story/StoryViewerModal"
import { UserStoryGroup } from "../types/story.type"

export default function Home() {
  const dispatch = useDispatch()
  const {
    posts = [],
    //stories = [],
    loading,
    loadingMore,
    hasMore,
    currentPage
  } = useSelector((state: RootState) => state.post)

  const {
    stories: storyGroups,
    loading: storyLoading,
    loadingMore: storyLoadingMore,
    hasMore: hasMoreStories,
  } = useSelector((state: RootState) => state.story)

  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [viewingGroup, setViewingGroup] = useState<UserStoryGroup | null>(null)
  const observerTarget = useRef<HTMLDivElement>(null)
  const isFetchingRef = useRef(false)
  const storyObserverRef = useRef<HTMLDivElement>(null)
  const [showAddStory, setShowAddStory] = useState(false)
  const [storySharedPost, setStorySharedPost] = useState<Post | null>(null)

  useEffect(() => {
    dispatch(fetchStories())
  }, [])

  useEffect(() => {
    const el = storyObserverRef.current
    if (!el) return

    const observer = new IntersectionObserver(entries => {
      if (
        entries[0].isIntersecting &&
        !storyLoading &&
        hasMoreStories
      ) {
        dispatch(fetchMoreStories())
      }
    }, { rootMargin: "200px" })

    observer.observe(el)
    return () => observer.disconnect()
  }, [storyLoading, hasMoreStories])

  // Initial load
  useEffect(() => {
    dispatch(fetchHomeFeed())
  }, [dispatch])

  // Infinite scroll observer
  const lastPageRef = useRef<number | null>(null)

  useEffect(() => {
    const element = observerTarget.current
    if (!element) return

    const observer = new IntersectionObserver(entries => {
      const [entry] = entries

      if (
        entry.isIntersecting &&
        !loading &&
        !loadingMore &&
        hasMore &&
        posts.length > 0 &&
        !isFetchingRef.current
      ) {
        isFetchingRef.current = true
        observer.unobserve(element)
        dispatch(fetchMorePosts())
      }
    }, { rootMargin: "200px" })

    observer.observe(element)

    return () => observer.disconnect()
  }, [dispatch, loading, loadingMore, hasMore, currentPage])

  useEffect(() => {
    if (currentPage !== lastPageRef.current) {
      lastPageRef.current = currentPage
      isFetchingRef.current = false
    }
  }, [currentPage])

  const handleShareToStory = useCallback((post: Post) => {
    setStorySharedPost(post)
    setShowAddStory(true)
    setSelectedPost(null) // Close post modal if open, optional
  }, [])

  return (
    <div className="max-w-2xl mx-auto py-4 px-4">

      {/* ===== STORIES ===== */}
      <div className="bg-white p-4 mb-6 overflow-x-auto">
        <div className="flex gap-4">

          {/* ADD STORY */}
          <AddStoryBubble onClick={() => {
            setStorySharedPost(null)
            setShowAddStory(true)
          }} />

          {/* LOADING */}
          {storyLoading && storyGroups.length === 0 && <StorySkeleton />}

          {/* EMPTY */}
          {!storyLoading && storyGroups.length === 0 && <EmptyStories />}

          {/* STORIES */}
          {storyGroups.map(group => (
            <StoryBubble
              key={group.user.id}
              group={group}
              onClick={() => setViewingGroup(group)}
            />
          ))}

          {/* PAGING TRIGGER */}
          {hasMoreStories && (
            <div ref={storyObserverRef} className="w-1" />
          )}
        </div>
      </div>

      {/* ===== POSTS ===== */}
      <div>

        {/* Initial loading skeleton */}
        {loading && posts.length === 0 && (
          <>
            <div className="space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-white animate-pulse">
                  <div className="px-3 py-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300" />
                    <div className="h-3 w-24 bg-gray-300 rounded" />
                  </div>
                  <div className="aspect-square bg-gray-300 border-y border-gray-200" />
                  <div className="px-3 py-2 space-y-2">
                    <div className="h-6 w-6 bg-gray-300 rounded" />
                    <div className="h-3 w-full bg-gray-300 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Posts list */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No posts to show
          </div>
        )}

        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onPostClick={setSelectedPost}
          />
        ))}

        {/* Infinite scroll trigger */}
        {hasMore && (
          <div ref={observerTarget} className="py-8">
            {loadingMore && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            )}
          </div>
        )}

        {/* End of posts message */}
        {/* {!loading && !hasMore && posts.length > 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            You're all caught up! 🎉
          </div>
        )} */}
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onShareToStory={handleShareToStory}
        />
      )}

      {/* Story Viewer Modal */}
      {viewingGroup && (
        <StoryViewerModal
          group={viewingGroup}
          onClose={() => setViewingGroup(null)}
        />
      )}

      {showAddStory && (
        <AddStoryModal
          sharedPost={storySharedPost}
          onClose={() => {
            setShowAddStory(false)
            setStorySharedPost(null)
          }}
          onSubmit={(file, postId) => {
            if (postId) {
              dispatch(shareStoryRequest(postId))
            } else if (file) {
              const form = new FormData()
              form.append("files", file)
              dispatch(createStoryRequest(form))
            }
            setShowAddStory(false)
            setStorySharedPost(null)
          }}
        />
      )}
    </div>
  )
}