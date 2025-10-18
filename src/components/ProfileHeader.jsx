"use client"
import { Settings } from "lucide-react"

export default function ProfileHeader({ user, isOwnProfile, onEditProfile }) {
  return (
    <div className="card p-6 mb-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Avatar */}
        <div className="flex justify-center md:justify-start">
          <img
            src={user.avatar || "/placeholder.svg"}
            alt={user.username}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          {/* Username and Actions */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <h1 className="text-2xl font-light">{user.username}</h1>
            {isOwnProfile ? (
              <div className="flex gap-2">
                <button onClick={onEditProfile} className="btn-secondary">
                  Edit profile
                </button>
                <button className="btn-secondary">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button className="btn-primary">Follow</button>
                <button className="btn-secondary">Message</button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-8 justify-center md:justify-start">
            <div className="text-center md:text-left">
              <span className="font-semibold">{user.posts}</span>
              <span className="text-gray-500 ml-1">posts</span>
            </div>
            <div className="text-center md:text-left">
              <span className="font-semibold">{user.followers.toLocaleString()}</span>
              <span className="text-gray-500 ml-1">followers</span>
            </div>
            <div className="text-center md:text-left">
              <span className="font-semibold">{user.following.toLocaleString()}</span>
              <span className="text-gray-500 ml-1">following</span>
            </div>
          </div>

          {/* Bio */}
          <div>
            <p className="font-semibold">{user.fullName}</p>
            <p className="text-sm whitespace-pre-line">{user.bio}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
