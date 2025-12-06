"use client";
import { Settings, MoreHorizontal } from "lucide-react";
import { User as AuthUser } from "../redux/features/auth/authSlice";
import { User as ProfileUser } from "../redux/features/user/userSlice";

interface ProfileHeaderProps {
  profileUser: ProfileUser | null;
  currentUser: AuthUser | null;
  isOwnProfile: boolean;
  onEditProfile: () => void;
}

export default function ProfileHeader({ profileUser, currentUser, isOwnProfile, onEditProfile }: ProfileHeaderProps) {  
  if (!profileUser) return null;
  console.log("Rendering ProfileHeader for user:", profileUser);
  return (
    <div className="card p-6 mb-4">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Avatar */}
        <div className="flex justify-center md:justify-start">
          <img
            src={profileUser.avatar || "/placeholder.svg"}
            alt={profileUser.username}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <h1 className="text-2xl font-light">{profileUser.username}</h1>

            {isOwnProfile ? (
              <div className="flex gap-2">
                <button onClick={onEditProfile} className="btn-secondary">Edit profile</button>
                <button className="btn-secondary">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button className="btn-primary">Follow</button>
                <button className="btn-secondary">Message</button>
                <button className="btn-secondary">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-8 justify-center md:justify-start">
            <div className="text-center md:text-left">
              <span className="font-semibold">{profileUser.posts ?? 0}</span>
              <span className="text-gray-500 ml-1">posts</span>
            </div>

            <div className="text-center md:text-left">
              <span className="font-semibold">{(profileUser.followers ?? 0).toLocaleString()}</span>
              <span className="text-gray-500 ml-1">followers</span>
            </div>

            <div className="text-center md:text-left">
              <span className="font-semibold">{(profileUser.following ?? 0).toLocaleString()}</span>
              <span className="text-gray-500 ml-1">following</span>
            </div>
          </div>

          {/* Bio */}
          <div>
            <p className="font-semibold">{profileUser.fullName ?? ""}</p>
            <p className="text-sm whitespace-pre-line">{profileUser.bio ?? ""}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
