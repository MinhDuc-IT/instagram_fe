"use client"

import { useState } from "react"
import { useParams } from "react-router-dom"
import { Grid, Bookmark, Film, X } from "lucide-react"
import { useApp } from "../context/AppContext"
import ProfileHeader from "../components/ProfileHeader"

export default function Profile() {
  const { username } = useParams()
  const { currentUser, posts, updateProfile } = useApp()
  const [activeTab, setActiveTab] = useState("posts")
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    fullName: currentUser.fullName,
    bio: currentUser.bio,
  })

  const isOwnProfile = username === currentUser.username
  const userPosts = posts.filter((post) => post.username === username)
  const savedPosts = posts.filter((post) => post.isSaved)

  const handleEditSubmit = (e) => {
    e.preventDefault()
    updateProfile(editForm)
    setShowEditModal(false)
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <ProfileHeader user={currentUser} isOwnProfile={isOwnProfile} onEditProfile={() => setShowEditModal(true)} />

      {/* Tabs */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="flex justify-center gap-16">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-2 py-4 border-t ${
              activeTab === "posts" ? "border-black dark:border-white" : "border-transparent text-gray-500"
            }`}
          >
            <Grid className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Posts</span>
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-2 py-4 border-t ${
                activeTab === "saved" ? "border-black dark:border-white" : "border-transparent text-gray-500"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">Saved</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab("reels")}
            className={`flex items-center gap-2 py-4 border-t ${
              activeTab === "reels" ? "border-black dark:border-white" : "border-transparent text-gray-500"
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
            <div key={post.id} className="aspect-square">
              <img
                src={post.image || "/placeholder.svg"}
                alt="Post"
                className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
              />
            </div>
          ))}
        {activeTab === "saved" &&
          savedPosts.map((post) => (
            <div key={post.id} className="aspect-square">
              <img
                src={post.image || "/placeholder.svg"}
                alt="Saved Post"
                className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
              />
            </div>
          ))}
        {activeTab === "reels" && <div className="col-span-3 text-center py-12 text-gray-500">No reels yet</div>}
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
              <div>
                <label className="block text-sm font-semibold mb-2">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="input-field h-24 resize-none"
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
  )
}
