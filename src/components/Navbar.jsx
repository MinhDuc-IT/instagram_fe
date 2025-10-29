import { Link, useLocation } from "react-router-dom"
import { Home, Compass, Film, MessageCircle, Heart, PlusSquare} from "lucide-react"
import { useApp } from "../context/AppContext"

export default function Navbar() {
  const location = useLocation()
  const { currentUser } = useApp()

  const navItems = [
    { path: "/home", icon: Home, label: "Home" },
    { path: "/explore", icon: Compass, label: "Explore" },
    { path: "/reels", icon: Film, label: "Reels" },
    { path: "/messages", icon: MessageCircle, label: "Messages" },
    { path: "/notifications", icon: Heart, label: "Notifications" },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex justify-around items-center h-14">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`p-2 ${isActive(path) ? "text-black dark:text-white" : "text-gray-500"}`}
            aria-label={label}
          >
            <Icon className="w-6 h-6" fill={isActive(path) ? "currentColor" : "none"} />
          </Link>
        ))}
        <Link
          to={`/profile/${currentUser.username}`}
          className={`p-2 ${location.pathname.includes("/profile") ? "text-black dark:text-white" : "text-gray-500"}`}
        >
          <img
            src={currentUser.avatar || "/placeholder.svg"}
            alt={currentUser.username}
            className="w-6 h-6 rounded-full object-cover"
          />
        </Link>
      </div>
    </nav>
  )
}
