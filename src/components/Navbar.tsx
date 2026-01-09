import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import {
  Home,
  Compass,
  Film,
  MessageCircle,
  Heart,
  PlusSquare,
} from "lucide-react";
import CreatePostModal from "./CreatePost";
import { useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { user: currentUser } = useSelector(
    (state: RootState) => state.auth
  );

  const { unreadCount } = useSelector(
    (state: RootState) => state.notification
  );

  const { totalUnreadMessages } = useSelector(
    (state: RootState) => state.message
  );

  interface NavItem {
    path: string;
    icon: React.ElementType;
    label: string;
  }

  const navItems: NavItem[] = [
    { path: "/home", icon: Home, label: "Home" },
    { path: "/explore", icon: Compass, label: "Explore" },
    { path: "/reels", icon: Film, label: "Reels" },
    { path: "/messages", icon: MessageCircle, label: "Messages" },
    { path: "/notifications", icon: Heart, label: "Notifications" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-50">
        <div className="flex justify-around items-center h-14">
          {navItems.map(({ path, icon: Icon, label }) => {
            const showNotificationBadge = path === "/notifications" && unreadCount > 0;
            const showMessageBadge = path === "/messages" && totalUnreadMessages > 0;
            const showBadge = showNotificationBadge || showMessageBadge;

            return (
              <Link
                key={path}
                to={path}
                className={`relative p-2 ${isActive(path)
                  ? "text-black dark:text-white"
                  : "text-gray-500"
                  }`}
                aria-label={label}
              >
                <Icon
                  className="w-6 h-6"
                  strokeWidth={isActive(path) ? 2.5 : 1.5}
                />
                {showBadge && (
                  <span className="absolute top-0 right-0 bg-red-500 rounded-full w-2 h-2"></span>
                )}
              </Link>
            );
          })}

          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
            aria-label="Create"
          >
            <PlusSquare className="w-6 h-6" strokeWidth={1.5} />
          </button>

          {/* Profile */}
          <Link
            to={`/profile/${currentUser?.id}`}
            className={`p-2 ${location.pathname.includes("/profile")
              ? "text-black dark:text-white"
              : "text-gray-500"
              }`}
          >
            <img
              src={currentUser?.avatar || "/placeholder.svg"}
              alt={currentUser?.username}
              className="w-6 h-6 rounded-full object-cover"
            />
          </Link>
        </div>
      </nav>
      {showCreateModal && (
        <CreatePostModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
}
