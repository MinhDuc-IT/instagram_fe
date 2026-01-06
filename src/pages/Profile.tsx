import { useState, FormEvent, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid, Bookmark, Film, X, Loader, Heart, MessageCircle } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import ProfileHeader from "../components/ProfileHeader";
import { RootState, AppDispatch } from "../redux/store";
import { fetchProfileUserRequest, fetchSavedPostsRequest, fetchReelsRequest, fetchUserPostsRequest } from "../redux/features/user/userSlice";
import { Post } from "../types/post.type";
import PostModal from "../components/PostModal";
import EditProfileModal from "../components/EditProfileModal";

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const {
    profileUser,
    userPosts, userPostsHasMore, userPostsPage,
    savedPosts, savedPostsHasMore, savedPostsPage,
    userReels, userReelsHasMore, userReelsPage,
    loading, postsLoading
  } = useSelector((state: RootState) => state.users);

  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "reels">("posts");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const isOwnProfile = userId === currentUser?.id.toString();

  // Fetch profile user when userId changes
  useEffect(() => {
    if (userId) {
      const id = parseInt(userId);
      console.log("🔥 Fetching profile and initial posts for userId:", id);
      dispatch(fetchProfileUserRequest(id));
      dispatch(fetchUserPostsRequest({ userId: id, page: 1 }));
      setActiveTab("posts"); // Reset tab
    }
  }, [userId, dispatch]);

  // Fetch data when tab changes or scroll for more
  const fetchMoreData = () => {
    if (!userId || postsLoading) return;
    const id = parseInt(userId);

    if (activeTab === "posts" && userPostsHasMore) {
      dispatch(fetchUserPostsRequest({ userId: id, page: userPostsPage + 1 }));
    } else if (activeTab === "saved" && savedPostsHasMore && isOwnProfile) {
      dispatch(fetchSavedPostsRequest({ userId: id, page: savedPostsPage + 1 }));
    } else if (activeTab === "reels" && userReelsHasMore) {
      dispatch(fetchReelsRequest({ userId: id, page: userReelsPage + 1 }));
    }
  };

  useEffect(() => {
    if (!userId) return;
    const id = parseInt(userId);

    if (activeTab === "saved" && isOwnProfile && savedPosts.length === 0) {
      dispatch(fetchSavedPostsRequest({ userId: id, page: 1 }));
    } else if (activeTab === "reels" && userReels.length === 0) {
      dispatch(fetchReelsRequest({ userId: id, page: 1 }));
    }
  }, [activeTab, userId, isOwnProfile, dispatch]);

  // Infinite Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        fetchMoreData();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab, userPostsHasMore, savedPostsHasMore, userReelsHasMore, userPostsPage, savedPostsPage, userReelsPage, postsLoading, userId]);

  if (!currentUser || !profileUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <ProfileHeader
        profileUser={profileUser}
        currentUser={currentUser}
        isOwnProfile={isOwnProfile}
        onEditProfile={() => setShowEditModal(true)}
      />

      {/* Tabs */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="flex justify-center gap-16">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-2 py-4 border-t ${activeTab === "posts" ? "border-black dark:border-white" : "border-transparent text-gray-500"
              }`}
          >
            <Grid className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Posts</span>
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-2 py-4 border-t ${activeTab === "saved" ? "border-black dark:border-white" : "border-transparent text-gray-500"
                }`}
            >
              <Bookmark className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">Saved</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab("reels")}
            className={`flex items-center gap-2 py-4 border-t ${activeTab === "reels" ? "border-black dark:border-white" : "border-transparent text-gray-500"
              }`}
          >
            <Film className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Reels</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-1 mt-4">
        {activeTab === "posts" &&
          userPosts.map((post) => (
            <div
              key={post.id}
              className="aspect-square relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 group cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              {/* Carousel media */}
              <div className="w-full h-full flex transition-transform duration-300">
                {post.media.map((media, idx) => (
                  <div key={media.id} className="w-full h-full flex-shrink-0 relative">
                    {media.type === "video" ? (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        controls
                        muted
                        loop
                      />
                    ) : (
                      <img
                        src={media.url || "/placeholder.svg"}
                        alt={`Post media ${idx}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Caption */}
              {/* Caption removed to match design
              {post.caption && (
                <div className="absolute bottom-0 left-0 w-full flex items-center justify-center">
                  <div className="bg-black/80 text-white text-sm p-2 text-center w-full">
                    {post.caption}
                  </div>
                </div>
              )} */}

              {/* Hover overlay: like & comment */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-8 text-white transition-opacity">
                <div className="flex items-center gap-3">
                  <Heart size={28} fill={post.isLiked ? '#ef4444' : 'none'} stroke={post.isLiked ? '#ef4444' : 'white'} className={post.isLiked ? "text-red-500" : "text-white"} />
                  <span className="text-lg font-semibold">{(post.likes ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle size={28} className="text-white" />
                  <span className="text-lg font-semibold">{(post.commentsCount ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}

        {activeTab === "saved" &&
          savedPosts.map((post) => (
            <div
              key={post.id}
              className="aspect-square relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 group cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <img
                src={post.media[0]?.url || "/placeholder.svg"}
                alt="Saved Post"
                className="w-full h-full object-cover transition-opacity"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-8 text-white transition-opacity">
                <div className="flex items-center gap-3">
                  <Heart size={28} fill={post.isLiked ? '#ef4444' : 'none'} stroke={post.isLiked ? '#ef4444' : 'white'} className={post.isLiked ? "text-red-500" : "text-white"} />
                  <span className="text-lg font-semibold">{(post.likes ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle size={28} className="text-white" />
                  <span className="text-lg font-semibold">{(post.commentsCount ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}

        {activeTab === "reels" && (
          userReels.length > 0 ? (
            userReels.map((post) => (
              <div
                key={post.id}
                className="aspect-[9/16] relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 group cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <video
                  src={post.media[0]?.url || "/placeholder.svg"}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white shadow-sm">
                  <Heart size={16} fill="white" />
                  <span className="text-xs font-semibold">{post.likes}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-gray-500">No reels yet</div>
          )
        )}
      </div>

      {/* Loading indicator for more posts */}
      {postsLoading && (
        <div className="flex justify-center py-4">
          <Loader className="animate-spin w-6 h-6 text-gray-400" />
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={profileUser as any}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Post detail modal */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}
