import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import {
  Home,
  Compass,
  Film,
  MessageCircle,
  Heart,
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const { user: currentUser } = useSelector(
    (state: RootState) => state.auth
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-50">
        <div className="flex justify-around items-center h-14">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`p-2 ${
                isActive(path)
                  ? "text-black dark:text-white"
                  : "text-gray-500"
              }`}
              aria-label={label}
            >
              <Icon
                className="w-6 h-6"
                strokeWidth={isActive(path) ? 2.5 : 1.5}
              />
            </Link>
          ))}

          {/* Profile */}
          <Link
            to={`/profile/${currentUser?.id}`}
            className={`p-2 ${
              location.pathname.includes("/profile")
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
      // <nav className="md:hidden fixed left-0 top-0 bottom-0 w-16 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 z-50">
      //     <div className="flex flex-col items-center gap-4 py-4 h-full">
      //         {navItems.map(({ path, icon: Icon, label }) => (
      //             <Link
      //                 key={path}
      //                 to={path}
      //                 className={`p-2 ${isActive(path) ? 'text-black dark:text-white' : 'text-gray-500'}`}
      //                 aria-label={label}
      //             >
      //                 <Icon className="w-6 h-6" />
      //             </Link>
      //         ))}

      //         <Link
      //             to={`/profile/${currentUser?.id}`}
      //             className={`p-2 ${
      //                 location.pathname.includes('/profile') ? 'text-black dark:text-white' : 'text-gray-500'
      //             }`}
      //             aria-label="Profile"
      //         >
      //             <img
      //                 src={currentUser?.avatar || '/placeholder.svg'}
      //                 alt={currentUser?.username}
      //                 className="w-6 h-6 rounded-full object-cover"
      //             />
      //         </Link>
      //     </div>
      // </nav>
  );
}
