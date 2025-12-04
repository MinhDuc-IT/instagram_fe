import { useState, FormEvent, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid, Bookmark, Film, X, Loader } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import ProfileHeader from "../components/ProfileHeader";
import { RootState, AppDispatch } from "../redux/store";
import { updateProfileRequest } from "../redux/features/auth/authSlice";
import { fetchProfileUserRequest, fetchSavedPostsRequest } from "../redux/features/user/userSlice";
import { Post } from "../types/post.type";
import { Heart, MessageCircle } from "lucide-react";

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { profileUser, userPosts, savedPosts, loading } = useSelector((state: RootState) => state.users);

  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "reels">("posts");
  const [showEditModal, setShowEditModal] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: currentUser?.fullName || "",
  });

  // Fetch profile user when userId changes
  useEffect(() => {
    if (userId) {
      const id = parseInt(userId);
      console.log("🔥 Fetching profile for userId:", id);
      dispatch(fetchProfileUserRequest(id));
    }
  }, [userId]); // Remove dispatch from dependencies

  // Update edit form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setEditForm({ fullName: currentUser.fullName || "" });
    }
  }, [currentUser]);

  if (!currentUser || !profileUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin w-8 h-8" />
      </div>
    );
  }

  const isOwnProfile = userId === currentUser.id.toString();

  // Filter saved posts (only for own profile)
  const filteredSavedPosts = isOwnProfile ? userPosts.filter((post: Post) => post.isSaved) : [];

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Submitting edit profile with:", editForm);
    dispatch(updateProfileRequest({ fullName: editForm.fullName }));
    setShowEditModal(false);
  };

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
              className="aspect-square relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 group"
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
              {post.caption && (
                <div className="absolute bottom-0 left-0 w-full flex items-center justify-center">
                  <div className="bg-gradient-to-t from-black/90 via-black/60 to-black/15 text-white text-sm p-2 text-center rounded-t-md w-full">
                    {post.caption}
                  </div>
                </div>
              )}

              {/* Hover overlay: like & comment */}
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 text-white transition-opacity">
                <div className="flex items-center gap-2">
                  <Heart
                    size={24}
                    className={post.isLiked ? "text-red-500" : "text-white"}
                    strokeWidth={2}
                  />
                  <span className="text-sm font-medium">{post.likes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle size={24} strokeWidth={2} />
                  <span className="text-sm font-medium">{post.comments?.length || 0}</span>
                </div>
              </div>
            </div>
          ))}

        {activeTab === "saved" &&
          filteredSavedPosts.map((post) => (
            <div
              key={post.id}
              className="aspect-square relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 group"
            >
              <img
                src={post.media[0]?.url || "/placeholder.svg"}
                alt="Saved Post"
                className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 text-white transition-opacity">
                <div className="flex items-center gap-2">
                  <Heart
                    size={24}
                    className={post.isLiked ? "text-red-500" : "text-white"}
                    strokeWidth={2}
                  />
                  <span className="text-sm font-medium">{post.likes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle size={24} strokeWidth={2} />
                  <span className="text-sm font-medium">{post.comments?.length || 0}</span>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold">Edit Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="input-field"
                />
              </div>
              <button type="submit" className="w-full btn-primary">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
