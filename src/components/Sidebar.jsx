"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Home, Compass, Film, MessageCircle, Heart, PlusSquare, LogOut } from "lucide-react"
import { useApp } from "../context/AppContext"
import ThemeToggle from "./ThemeToggle"
import ModalCreatePost from "./ModalCreatePost"

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useApp()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const navItems = [
    { path: "/home", icon: Home, label: "Home" },
    { path: "/explore", icon: Compass, label: "Explore" },
    { path: "/reels", icon: Film, label: "Reels" },
    { path: "/messages", icon: MessageCircle, label: "Messages" },
    { path: "/notifications", icon: Heart, label: "Notifications" },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <>
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-black z-50 p-4">
        <div className="mb-8 px-3 py-4">
          <h1 className="text-2xl font-bold">Instagram</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${
                isActive(path) ? "font-bold" : "hover:bg-gray-100 dark:hover:bg-gray-900"
              }`}
            >
              <Icon className="w-6 h-6" fill={isActive(path) ? "currentColor" : "none"} />
              <span>{label}</span>
            </Link>
          ))}

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors w-full"
          >
            <PlusSquare className="w-6 h-6" />
            <span>Create</span>
          </button>

          <Link
            to={`/profile/${currentUser.username}`}
            className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${
              location.pathname.includes("/profile") ? "font-bold" : "hover:bg-gray-100 dark:hover:bg-gray-900"
            }`}
          >
            <img
              src={currentUser.avatar || "/placeholder.svg"}
              alt={currentUser.username}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span>Profile</span>
          </Link>
        </nav>

        <div className="space-y-2 border-t border-gray-200 dark:border-gray-800 pt-4">
          <div className="flex items-center gap-4 px-3 py-3">
            <ThemeToggle />
            <span>Theme</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors w-full"
          >
            <LogOut className="w-6 h-6" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {showCreateModal && <ModalCreatePost onClose={() => setShowCreateModal(false)} />}
    </>
  )
}
