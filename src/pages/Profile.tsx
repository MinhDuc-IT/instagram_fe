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
      <div className="border-t border-gray-200 dark:border-gray-800 mt-4 md:mt-10">
        <div className="flex justify-center gap-12 md:gap-16">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-1.5 py-4 border-t-2 -mt-[1px] transition-colors ${activeTab === "posts"
                ? "border-black dark:border-white text-black dark:text-white"
                : "border-transparent text-gray-500"
              }`}
          >
            <Grid className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-[12px] font-semibold tracking-widest uppercase">Posts</span>
          </button>

          {isOwnProfile && (
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-1.5 py-4 border-t-2 -mt-[1px] transition-colors ${activeTab === "saved"
                  ? "border-black dark:border-white text-black dark:text-white"
                  : "border-transparent text-gray-500"
                }`}
            >
              <Bookmark className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-[12px] font-semibold tracking-widest uppercase">Saved</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("reels")}
            className={`flex items-center gap-1.5 py-4 border-t-2 -mt-[1px] transition-colors ${activeTab === "reels"
                ? "border-black dark:border-white text-black dark:text-white"
                : "border-transparent text-gray-500"
              }`}
          >
            <Film className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-[12px] font-semibold tracking-widest uppercase">Reels</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-[3px] md:gap-1 mt-0">
        {activeTab === "posts" &&
          userPosts.map((post) => (
            <div
              key={post.id}
              className="aspect-square relative overflow-hidden group cursor-pointer bg-gray-100 dark:bg-gray-900"
              onClick={() => setSelectedPost(post)}
            >
              {/* Media */}
              <div className="w-full h-full">
                {post.media[0]?.type === "video" ? (
                  <video
                    src={post.media[0].url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={post.media[0]?.url || "/placeholder.svg"}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Multiple media indicator */}
              {post.media.length > 1 && (
                <div className="absolute top-2 right-2 text-white drop-shadow-md">
                  <svg aria-label="Carousel" color="white" fill="white" height="20" role="img" viewBox="0 0 48 48" width="20">
                    <path d="M34.8 29.8V18.1c0-1.1-.9-2-2-2H21.1c-1.1 0-2 .9-2 2v11.7c0 1.1.9 2 2 2h11.7c1.1 0 2-.9 2-2zM9.2 34.8V9.2c0-1.1.9-2 2-2h25.6c1.1 0 2 .9 2 2v2.5h2.5c1.1 0 2 .9 2 2v25.6c0 1.1-.9 2-2 2H13.7c-1.1 0-2-.9-2-2V34.8H9.2z"></path>
                  </svg>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 md:gap-8 text-white transition-opacity duration-200">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Heart size={20} fill="white" className="md:w-6 md:h-6" />
                  <span className="text-[14px] md:text-[16px] font-bold">{(post.likes ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <MessageCircle size={20} fill="white" className="md:w-6 md:h-6" />
                  <span className="text-[14px] md:text-[16px] font-bold">{(post.commentsCount ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}

        {activeTab === "saved" &&
          savedPosts.map((post) => (
            <div
              key={post.id}
              className="aspect-square relative overflow-hidden group cursor-pointer bg-gray-100 dark:bg-gray-900"
              onClick={() => setSelectedPost(post)}
            >
              {/* Media */}
              <div className="w-full h-full">
                {post.media[0]?.type === "video" ? (
                  <video
                    src={post.media[0].url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={post.media[0]?.url || "/placeholder.svg"}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Multiple media indicator */}
              {post.media.length > 1 && (
                <div className="absolute top-2 right-2 text-white drop-shadow-md">
                  <svg aria-label="Carousel" color="white" fill="white" height="20" role="img" viewBox="0 0 48 48" width="20">
                    <path d="M34.8 29.8V18.1c0-1.1-.9-2-2-2H21.1c-1.1 0-2 .9-2 2v11.7c0 1.1.9 2 2 2h11.7c1.1 0 2-.9 2-2zM9.2 34.8V9.2c0-1.1.9-2 2-2h25.6c1.1 0 2 .9 2 2v2.5h2.5c1.1 0 2 .9 2 2v25.6c0 1.1-.9 2-2 2H13.7c-1.1 0-2-.9-2-2V34.8H9.2z"></path>
                  </svg>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 md:gap-8 text-white transition-opacity duration-200">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Heart size={20} fill="white" className="md:w-6 md:h-6" />
                  <span className="text-[14px] md:text-[16px] font-bold">{(post.likes ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <MessageCircle size={20} fill="white" className="md:w-6 md:h-6" />
                  <span className="text-[14px] md:text-[16px] font-bold">{(post.commentsCount ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}

        {activeTab === "reels" && (
          userReels.length > 0 ? (
            userReels.map((post) => (
              <div
                key={post.id}
                className="aspect-[9/16] relative overflow-hidden group cursor-pointer bg-gray-100 dark:bg-gray-900"
                onClick={() => setSelectedPost(post)}
              >
                <video
                  src={post.media[0]?.url || "/placeholder.svg"}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                  <Film size={16} fill="white" />
                  <span className="text-sm font-semibold">{post.likes}</span>
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-current flex items-center justify-center">
                  <Film size={32} />
                </div>
                <h3 className="text-xl font-bold">No Reels yet</h3>
              </div>
            </div>
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
