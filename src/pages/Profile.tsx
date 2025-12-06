import { useState, FormEvent, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid, Bookmark, Film, X, Loader, Heart, MessageCircle } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import ProfileHeader from "../components/ProfileHeader";
import { RootState, AppDispatch } from "../redux/store";
import { fetchProfileUserRequest, fetchSavedPostsRequest } from "../redux/features/user/userSlice";
import { Post } from "../types/post.type";
import PostModal from "../components/PostModal";
import EditProfileModal from "../components/EditProfileModal";

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { profileUser, userPosts, savedPosts, loading } = useSelector((state: RootState) => state.users);

  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "reels">("posts");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // const [editForm, setEditForm] = useState({
  //   fullName: currentUser?.fullName || "",
  // });

  // Fetch profile user when userId changes
  useEffect(() => {
    if (userId) {
      const id = parseInt(userId);
      console.log("🔥 Fetching profile for userId:", id);
      dispatch(fetchProfileUserRequest(id));
    }
  }, [userId]);

  // useEffect(() => {
  //   if (currentUser) {
  //     setEditForm({ fullName: currentUser.fullName || "" });
  //   }
  // }, [currentUser]);

  if (!currentUser || !profileUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin w-8 h-8" />
      </div>
    );
  }

  const isOwnProfile = userId === currentUser.id.toString();

  // Filter saved posts (only for own profile)
  console.log("Filtering saved posts for own profile:", isOwnProfile);
  console.log("User posts:", userPosts);
  const filteredSavedPosts = isOwnProfile ? userPosts.filter((post: Post) => post.isSaved) : [];

  // const handleEditSubmit = (e: FormEvent) => {
  //   e.preventDefault();
  //   console.log("Submitting edit profile with:", editForm);
  //   dispatch(updateProfileRequest({ fullName: editForm.fullName }));
  //   setShowEditModal(false);
  // };

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
                  <span className="text-lg font-semibold">{(post.comments?.length ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}

        {activeTab === "saved" &&
          filteredSavedPosts.map((post) => (
            <div
              key={post.id}
              className="aspect-square relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 group"
              onClick={() => setSelectedPost(post)}
            >
              <img
                src={post.media[0]?.url || "/placeholder.svg"}
                alt="Saved Post"
                className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-8 text-white transition-opacity">
                <div className="flex items-center gap-3">
                  <Heart size={28} fill={post.isLiked ? '#ef4444' : 'none'} stroke={post.isLiked ? '#ef4444' : 'white'} className={post.isLiked ? "text-red-500" : "text-white"} />
                  <span className="text-lg font-semibold">{(post.likes ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle size={28} className="text-white" />
                  <span className="text-lg font-semibold">{(post.comments?.length ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}

        {activeTab === "reels" && (
          <div className="col-span-3 text-center py-12 text-gray-500">No reels yet</div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={currentUser}
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
