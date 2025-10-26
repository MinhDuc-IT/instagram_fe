"use client"
import { Moon, Sun } from "lucide-react"
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/features/theme/themeSlice";

export default function ThemeToggle() {
  const theme = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
    </button>
  )
}
